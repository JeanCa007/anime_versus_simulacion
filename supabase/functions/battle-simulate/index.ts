import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CATEGORY_KEYS = [
  'strength',
  'speed',
  'durability',
  'stamina',
  'battle_iq',
  'technique',
  'experience',
  'attack_power',
  'defense',
  'regeneration',
  'range',
  'special_abilities',
  'hax',
];

const CATEGORY_ALIASES = {
  strength: ['strength', 'fuerza', 'rawpower'],
  speed: ['speed', 'velocidad'],
  durability: ['durability', 'resistance', 'resistencia'],
  stamina: ['stamina', 'resistanceendurance'],
  battle_iq: ['battleiq', 'biq', 'combatiq', 'intelligence'],
  technique: ['technique', 'techniqueandskill', 'skill', 'tecnicas'],
  experience: ['experience', 'experiencia'],
  attack_power: ['attackpower', 'attack', 'ataque'],
  defense: ['defense', 'defence', 'defensa'],
  regeneration: ['regeneration', 'regen', 'regeneracion'],
  range: ['range', 'rangescore', 'alcance'],
  special_abilities: ['specialabilities', 'abilities', 'habilidades', 'specialability'],
  hax: ['hax', 'haxscore', 'haxabilities'],
};

const DIFFICULTIES = [
  'no diff',
  'low diff',
  'low-mid diff',
  'mid diff',
  'mid-high diff',
  'high diff',
  'extreme diff',
  '50/50',
];

const SYSTEM_PROMPT = `You are an expert fictional battle analyst specialized in anime, manga and manhwa power scaling.
You receive structured database records for two fighters: descriptions, per-version stats (0-100), abilities, transformations, feats and weaknesses, plus the battle conditions.

Hard rules:
- Use ONLY the supplied data. Never invent feats, abilities, transformations or resistances that are not in the data.
- Never decide the winner only by raw power or by "power level".
- Analyse how each ability interacts with the opponent: counters, resistances, regeneration, stamina, battle IQ, experience, range, hax and win conditions.
- A character with lower raw stats can and should win if their abilities directly counter the opponent.
- Respect the battle conditions: battle type, location, knowledge, preparation, summons (armies/clones/familiars allowed or not) and transformations (allowed or base form only).
- If a key piece of information is missing, state the uncertainty inside the "reason" text instead of inventing it.
- Write all prose in Spanish (neutral Latin American Spanish), concise and precise.
- Return only a valid JSON object. No markdown, no code fences, no commentary.

Required JSON shape:
{
  "winner": "exact name of the winning character",
  "winProbability": 0-100 integer for the winner,
  "loserProbability": 0-100 integer for the loser,
  "difficulty": one of "no diff", "low diff", "low-mid diff", "mid diff", "mid-high diff", "high diff", "extreme diff", "50/50",
  "confidence": 0-100 integer,
  "summary": "2-3 sentence overview of the matchup",
  "finalVerdict": "detailed paragraph explaining exactly why the winner wins",
  "scores": {
    "strength": { "characterA": 0-100, "characterB": 0-100, "winner": "exact character name or Empate", "reason": "why" },
    "speed": {...}, "durability": {...}, "stamina": {...}, "battle_iq": {...}, "technique": {...},
    "experience": {...}, "attack_power": {...}, "defense": {...}, "regeneration": {...},
    "range": {...}, "special_abilities": {...}, "hax": {...}
  },
  "advantagesCharacterA": ["3 to 5 short bullet strings"],
  "advantagesCharacterB": ["3 to 5 short bullet strings"],
  "winConditionsCharacterA": ["how A can win, 2 to 4 bullets"],
  "winConditionsCharacterB": ["how B can win, 2 to 4 bullets"],
  "battleRounds": [
    { "title": "short round title", "description": "what happens using real abilities", "winner": "exact character name or empty string" }
  ]
}
battleRounds must contain 4 to 6 entries, escalate logically and end with the decisive round.`;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function text(value, maxLength = 1200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function stringList(value, maxItems = 6) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item, 400))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

function normalizeDifficulty(value) {
  const raw = String(value ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (DIFFICULTIES.includes(raw)) return raw;
  if (raw.includes('50')) return '50/50';
  if (raw.includes('extreme')) return 'extreme diff';
  if (raw.includes('mid high') || raw.includes('high mid')) return 'mid-high diff';
  if (raw.includes('low mid') || raw.includes('mid low')) return 'low-mid diff';
  if (raw.includes('high')) return 'high diff';
  if (raw.includes('low')) return 'low diff';
  if (raw.includes('none') || raw.includes('no ')) return 'no diff';
  return 'mid diff';
}

function normalizeKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findScoreEntry(scores, key) {
  const aliases = CATEGORY_ALIASES[key] ?? [key];
  for (const [rawKey, rawValue] of Object.entries(scores)) {
    if (!rawValue || typeof rawValue !== 'object') continue;
    if (aliases.includes(normalizeKey(rawKey))) {
      return rawValue;
    }
  }
  return null;
}

function buildScores(rawScores, nameA, nameB, versionA, versionB) {
  const fallbackMap = {
    range: 'range_score',
    special_abilities: 'special_abilities_score',
    hax: 'hax_score',
  };

  const result = {};

  for (const key of CATEGORY_KEYS) {
    const entry = findScoreEntry(rawScores, key);
    const fallbackKey = fallbackMap[key] ?? key;
    const fallbackA = clampScore(versionA[fallbackKey]);
    const fallbackB = clampScore(versionB[fallbackKey]);

    const scoreA = entry ? clampScore(entry.characterA ?? entry.a) : fallbackA;
    const scoreB = entry ? clampScore(entry.characterB ?? entry.b) : fallbackB;
    const rawWinner = text(entry?.winner, 120);

    let winner = rawWinner;
    const lowerWinner = rawWinner.toLowerCase();
    if (!winner || (lowerWinner !== nameA.toLowerCase() && lowerWinner !== nameB.toLowerCase())) {
      if (scoreA > scoreB) winner = nameA;
      else if (scoreB > scoreA) winner = nameB;
      else winner = 'Empate';
    }

    result[key] = {
      characterA: scoreA,
      characterB: scoreB,
      winner,
      reason: text(entry?.reason, 900),
    };
  }

  return result;
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function stripCodeFences(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```[a-zA-Z]*\s*/, '')
    .replace(/```$/, '')
    .trim();
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadFighter(admin, versionId) {
  const { data: version, error: versionError } = await admin
    .from('character_versions')
    .select('*')
    .eq('id', versionId)
    .maybeSingle();

  if (versionError) throw new Error(versionError.message);
  if (!version) throw new Error('Una de las versiones seleccionadas no existe.');

  const { data: character, error: characterError } = await admin
    .from('characters')
    .select('id, name, slug, alias, description, archetype, popularity, series_id')
    .eq('id', version.character_id)
    .maybeSingle();

  if (characterError) throw new Error(characterError.message);
  if (!character) throw new Error('Uno de los personajes seleccionados no existe.');

  let series = null;
  if (character.series_id) {
    const { data: seriesRow } = await admin
      .from('series')
      .select('name, universe, type')
      .eq('id', character.series_id)
      .maybeSingle();
    series = seriesRow ?? null;
  }

  const { data: abilityLinks } = await admin
    .from('character_abilities')
    .select('ability_id')
    .eq('character_id', character.id)
    .limit(8);

  const abilityIds = (abilityLinks ?? [])
    .map((link) => link.ability_id)
    .filter((value) => Boolean(value));

  let abilities = [];
  if (abilityIds.length > 0) {
    const { data: abilityRows } = await admin
      .from('abilities')
      .select('name, category, description')
      .in('id', abilityIds);
    abilities = abilityRows ?? [];
  }

  const [featsResult, weaknessesResult, transformationsResult] = await Promise.all([
    admin.from('feats').select('title, description, source').eq('character_id', character.id).limit(5),
    admin.from('weaknesses').select('description').eq('character_id', character.id).limit(5),
    admin
      .from('transformations')
      .select('name, description')
      .eq('character_id', character.id)
      .limit(6),
  ]);

  return {
    character,
    series,
    version,
    abilities,
    feats: featsResult.data ?? [],
    weaknesses: weaknessesResult.data ?? [],
    transformations: transformationsResult.data ?? [],
  };
}

function buildPrompt(fighterA, fighterB, conditions) {
  const payloadA = {
    name: fighterA.character.name,
    alias: fighterA.character.alias,
    series: fighterA.series,
    description: fighterA.character.description,
    archetype: fighterA.character.archetype,
    version: {
      name: fighterA.version.name,
      description: fighterA.version.description,
      stats: {
        strength: fighterA.version.strength,
        speed: fighterA.version.speed,
        durability: fighterA.version.durability,
        stamina: fighterA.version.stamina,
        intelligence: fighterA.version.intelligence,
        battle_iq: fighterA.version.battle_iq,
        technique: fighterA.version.technique,
        experience: fighterA.version.experience,
        attack_power: fighterA.version.attack_power,
        defense: fighterA.version.defense,
        regeneration: fighterA.version.regeneration,
        range: fighterA.version.range_score,
        special_abilities: fighterA.version.special_abilities_score,
        hax: fighterA.version.hax_score,
      },
      canon_status: fighterA.version.canon_status,
    },
    abilities: fighterA.abilities,
    transformations: fighterA.transformations,
    feats: fighterA.feats,
    weaknesses: fighterA.weaknesses,
  };

  const payloadB = {
    name: fighterB.character.name,
    alias: fighterB.character.alias,
    series: fighterB.series,
    description: fighterB.character.description,
    archetype: fighterB.character.archetype,
    version: {
      name: fighterB.version.name,
      description: fighterB.version.description,
      stats: {
        strength: fighterB.version.strength,
        speed: fighterB.version.speed,
        durability: fighterB.version.durability,
        stamina: fighterB.version.stamina,
        intelligence: fighterB.version.intelligence,
        battle_iq: fighterB.version.battle_iq,
        technique: fighterB.version.technique,
        experience: fighterB.version.experience,
        attack_power: fighterB.version.attack_power,
        defense: fighterB.version.defense,
        regeneration: fighterB.version.regeneration,
        range: fighterB.version.range_score,
        special_abilities: fighterB.version.special_abilities_score,
        hax: fighterB.version.hax_score,
      },
      canon_status: fighterB.version.canon_status,
    },
    abilities: fighterB.abilities,
    transformations: fighterB.transformations,
    feats: fighterB.feats,
    weaknesses: fighterB.weaknesses,
  };

  return `Analyse this hypothetical battle and return the JSON object described in the system prompt.

CHARACTER A RECORD:
${JSON.stringify(payloadA)}

CHARACTER B RECORD:
${JSON.stringify(payloadB)}

BATTLE CONDITIONS:
${JSON.stringify(conditions)}

The "winner" field must be exactly "${fighterA.character.name}" or "${fighterB.character.name}".
The scores object must contain all 13 categories with a reason for each.
Scores are independent per character (0-100) and do not need to be symmetric.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: 'La configuracion del backend esta incompleta.' }, 500);
    }
    if (!openAiKey) {
      return jsonResponse(
        {
          error:
            'Falta la clave OPENAI_API_KEY en los secretos del proyecto. Configurala para activar el simulador.',
        },
        500,
      );
    }

    const body = await req.json().catch(() => null);
    const versionAId = typeof body?.versionAId === 'string' ? body.versionAId : '';
    const versionBId = typeof body?.versionBId === 'string' ? body.versionBId : '';

    if (!UUID_PATTERN.test(versionAId) || !UUID_PATTERN.test(versionBId)) {
      return jsonResponse({ error: 'Las versiones seleccionadas no son validas.' }, 400);
    }

    const rawConditions = body?.conditions ?? {};
    const conditions = {
      battle_type: text(rawConditions.battle_type, 40) || 'standard',
      location: text(rawConditions.location, 40) || 'neutral-arena',
      knowledge: text(rawConditions.knowledge, 40) || 'none',
      preparation: text(rawConditions.preparation, 40) || 'none',
      summons: text(rawConditions.summons, 40) || 'allowed',
      transformations: text(rawConditions.transformations, 40) || 'allowed',
    };

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const battleHash = await sha256(
      JSON.stringify({ version: 'v1', a: versionAId, b: versionBId, conditions }),
    );

    const { data: cachedBattle } = await admin
      .from('battles')
      .select('id')
      .eq('battle_hash', battleHash)
      .maybeSingle();

    if (cachedBattle?.id) {
      return jsonResponse({ battleId: cachedBattle.id, cached: true });
    }

    const [fighterA, fighterB] = await Promise.all([
      loadFighter(admin, versionAId),
      loadFighter(admin, versionBId),
    ]);

    const nameA = String(fighterA.character.name);
    const nameB = String(fighterB.character.name);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(fighterA, fighterB, conditions) },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error('OpenAI error', openAiResponse.status, errorText);
      const reason =
        openAiResponse.status === 401
          ? 'La clave de OpenAI es invalida o fue revocada.'
          : openAiResponse.status === 429
            ? 'OpenAI rechazo la solicitud por limite de uso. Intenta de nuevo en unos segundos.'
            : `OpenAI respondio con estado ${openAiResponse.status}.`;
      return jsonResponse({ error: reason }, 502);
    }

    const completion = await openAiResponse.json();
    const rawContent = completion?.choices?.[0]?.message?.content;

    if (typeof rawContent !== 'string' || rawContent.trim().length === 0) {
      return jsonResponse({ error: 'La IA no devolvio contenido analizable.' }, 502);
    }

    let parsed;
    try {
      parsed = JSON.parse(stripCodeFences(rawContent));
    } catch (parseError) {
      console.error('JSON invalido de OpenAI', parseError, rawContent.slice(0, 500));
      return jsonResponse({ error: 'La IA devolvio un formato invalido. Intenta de nuevo.' }, 502);
    }

    if (!parsed || typeof parsed !== 'object') {
      return jsonResponse({ error: 'La IA devolvio un analisis vacio.' }, 502);
    }

    const rawScores =
      parsed.scores && typeof parsed.scores === 'object' ? parsed.scores : {};

    const scoreMap = buildScores(
      rawScores,
      nameA,
      nameB,
      fighterA.version,
      fighterB.version,
    );

    const scoreSumA = CATEGORY_KEYS.reduce((total, key) => total + scoreMap[key].characterA, 0);
    const scoreSumB = CATEGORY_KEYS.reduce((total, key) => total + scoreMap[key].characterB, 0);

    const rawWinner = text(parsed.winner, 160);
    let winnerSide;
    if (rawWinner.toLowerCase() === nameB.toLowerCase()) winnerSide = 'b';
    else if (rawWinner.toLowerCase() === nameA.toLowerCase()) winnerSide = 'a';
    else winnerSide = scoreSumB > scoreSumA ? 'b' : 'a';

    const winnerName = winnerSide === 'a' ? nameA : nameB;
    const winnerCharacterId = winnerSide === 'a' ? fighterA.character.id : fighterB.character.id;

    let winProbability = clampScore(parsed.winProbability);
    if (winProbability < 50) winProbability = 100 - winProbability;
    winProbability = Math.max(51, Math.min(99, winProbability || 55));
    const loserProbability = 100 - winProbability;

    const rawRounds = Array.isArray(parsed.battleRounds) ? parsed.battleRounds : [];
    const rounds = rawRounds
      .filter((round) => round && typeof round === 'object')
      .slice(0, 6)
      .map((round, index) => ({
        round_number: index + 1,
        title: text(round.title, 160) || `Ronda ${index + 1}`,
        description: text(round.description, 1400),
        winner_name: text(round.winner, 160) || null,
      }))
      .filter((round) => round.description.length > 0);

    const battleRow = {
      battle_hash: battleHash,
      character_a_id: fighterA.character.id,
      version_a_id: versionAId,
      character_b_id: fighterB.character.id,
      version_b_id: versionBId,
      battle_type: conditions.battle_type,
      location: conditions.location,
      knowledge: conditions.knowledge,
      preparation: conditions.preparation,
      summons: conditions.summons,
      transformations: conditions.transformations,
      winner_character_id: winnerCharacterId,
      winner_name: winnerName,
      win_probability: winProbability,
      loser_probability: loserProbability,
      difficulty: normalizeDifficulty(parsed.difficulty),
      summary: text(parsed.summary, 1600) || null,
      final_verdict: text(parsed.finalVerdict, 2600) || null,
      confidence: clampScore(parsed.confidence) || 70,
      scores: scoreMap,
      advantages_a: stringList(parsed.advantagesCharacterA),
      advantages_b: stringList(parsed.advantagesCharacterB),
      win_conditions_a: stringList(parsed.winConditionsCharacterA),
      win_conditions_b: stringList(parsed.winConditionsCharacterB),
      ai_model: model,
      is_ai: true,
    };

    const { data: insertedBattle, error: insertError } = await admin
      .from('battles')
      .insert(battleRow)
      .select('id')
      .single();

    if (insertError || !insertedBattle) {
      if (insertError?.code === '23505') {
        const { data: existing } = await admin
          .from('battles')
          .select('id')
          .eq('battle_hash', battleHash)
          .maybeSingle();
        if (existing?.id) {
          return jsonResponse({ battleId: existing.id, cached: true });
        }
      }
      console.error('Insert battle error', insertError);
      return jsonResponse({ error: 'No se pudo guardar la batalla en la base de datos.' }, 500);
    }

    const battleId = insertedBattle.id;

    if (rounds.length > 0) {
      const { error: roundsError } = await admin.from('battle_rounds').insert(
        rounds.map((round) => ({
          battle_id: battleId,
          round_number: round.round_number,
          title: round.title,
          description: round.description,
          winner_name: round.winner_name,
        })),
      );
      if (roundsError) console.error('Insert rounds error', roundsError);
    }

    const { error: scoresError } = await admin.from('battle_scores').insert(
      CATEGORY_KEYS.map((key) => ({
        battle_id: battleId,
        category: key,
        score_a: scoreMap[key].characterA,
        score_b: scoreMap[key].characterB,
        winner_name: scoreMap[key].winner,
        reason: scoreMap[key].reason,
      })),
    );
    if (scoresError) console.error('Insert scores error', scoresError);

    return jsonResponse({ battleId, cached: false });
  } catch (error) {
    console.error('battle-simulate failure', error);
    const message =
      error instanceof Error ? error.message : 'Error inesperado en el motor de batalla.';
    return jsonResponse({ error: message }, 500);
  }
});
