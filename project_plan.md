# Anime Battle Arena

## 1. Project Description
Plataforma para comparar personajes de anime, manga y manhwa, revisar sus estadísticas por versión y simular combates hipotéticos analizados con inteligencia artificial. Público: fans de anime, comunidades de debate de "quién ganaría", creadores de contenido de power scaling.

Propuesta de valor: no decidir por "power level" puro, sino por interacción de habilidades, hax, counters, resistencia, stamina, battle IQ y condiciones de combate, con resultados persistidos y reutilizables.

## 2. Page Structure
- `/` — Home: hero "¿Quién ganaría?", buscador doble con autocomplete, batallas populares
- `/characters` — Catálogo de personajes con búsqueda, filtros y paginación
- `/character/:slug` — Ficha de personaje: versiones, radar, stats, habilidades, feats, debilidades
- `/battle/new` — Configurador de combate (versiones + condiciones)
- `/battle/:id` — Resultado de batalla: ganador, probabilidad, radar, comparación, simulación, veredicto
- `/rankings` — Rankings: más poderosos, más batallas, más victorias, mejor win rate
- `/history` — Historial de batallas con enlace al resultado
- `/admin` — Panel de administración (series, personajes, versiones, generación con IA)

## 3. Core Features
- [x] Modelo de datos completo (series, characters, character_versions, abilities, character_abilities, transformations, feats, weaknesses, battles, battle_rounds, battle_scores)
- [x] Seed amplio de series, personajes y versiones con estadísticas 0-100
- [x] Buscador con autocomplete multi-campo (nombre, alias, serie, universo, versión)
- [x] Catálogo con filtros (serie, tipo, popularidad, A-Z) y paginación
- [x] Ficha de personaje con selector de versiones, radar y stats
- [x] Comparador interactivo en home (radar, 10 categorías y probabilidad estimada)
- [x] Habilidades, transformaciones, feats y debilidades cargadas para los personajes principales
- [x] Selector de condiciones de batalla (tipo, escenario, conocimiento, preparación, invocaciones, transformaciones)
- [x] Edge Function `battle-simulate` con OpenAI (prompt de analista, validación de JSON)
- [x] Cache de batallas por hash (versiones + condiciones) con reutilización del análisis
- [x] Simulación por rondas, dificultad, veredicto final y win conditions
- [x] Pantalla de resultado `/battle/:id` con radar, comparación por 13 categorías, rondas y veredicto
- [ ] Historial y rankings
- [ ] Admin CRUD + "Generate with AI" con estado PENDING REVIEW y aprobación

## 4. Data Model Design
Base de datos: Supabase Postgres (conectada).

### series
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| name | text | Nombre de la obra |
| slug | text unique | Identificador URL |
| type | text | anime / manga / manhwa |
| universe | text | Universo narrativo |
| description | text | Sinopsis breve |

### characters
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| name | text | Nombre |
| slug | text unique | Identificador URL |
| alias | text | Alias / título |
| series_id | uuid | FK series |
| description | text | Descripción |
| main_image_url / thumbnail_url | text | Imágenes |
| popularity | int | 0-100 |
| base_power | int | Potencia base para derivar stats |
| archetype | text | brawler / speedster / tank / hax / technique / regenerator / balanced |
| status | text | published / ai_generated / pending_review |

### character_versions
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| character_id | uuid | FK characters |
| name | text | Nombre de la versión |
| description | text | Descripción |
| image_url | text | Imagen de la versión |
| strength, speed, durability, stamina, intelligence, battle_iq, technique, experience, attack_power, defense, regeneration, range_score, special_abilities_score, hax_score | int | Escala 0-100 |
| canon_status | text | canon / non-canon / composite |

### abilities / character_abilities
Habilidades reutilizables y su relación con personajes/versiones.

### transformations
Transformaciones por personaje y versión.

### feats / weaknesses
Hazañas y debilidades citables por personaje/versión.

### battles
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| battle_hash | text unique | Cache por personajes + versiones + condiciones |
| character_a_id / version_a_id | uuid | Lado A |
| character_b_id / version_b_id | uuid | Lado B |
| battle_type, location, knowledge, preparation, summons, transformations | text | Condiciones |
| winner_name, win_probability, loser_probability, difficulty | text/int | Resultado |
| summary, final_verdict | text | Análisis |
| scores | jsonb | Comparación por categoría |
| advantages_a / advantages_b / win_conditions_a / win_conditions_b | jsonb | Listas |
| confidence | int | Confianza del análisis |

### battle_rounds / battle_scores
Rondas de la simulación y puntuaciones por categoría normalizadas.

## 5. Backend / Third-party Integration Plan
- Database: Supabase (SaaS) — conectada. Escrituras sensibles vía Edge Functions con service role; lectura pública con RLS de solo lectura.
- OpenAI: Edge Function `battle-simulate`. `OPENAI_API_KEY` guardada como secreto del servidor, nunca en el frontend. Modelo configurable con `OPENAI_MODEL`.
- Shopify / Stripe: no requeridos.
- Auth: no requerida en el MVP; el panel admin se protege con clave de acceso y escrituras server-side.

## 6. Development Phase Plan

### Fase 1: Base de datos, catálogo y home
- Objetivo: datos reales + identidad visual + navegación y búsqueda.
- Entregable: esquema SQL con RLS, seed de series/personajes/versiones, sistema de diseño oscuro, home con hero y buscador doble, buscador con autocomplete, catálogo `/characters` con filtros y paginación.

### Fase 2: Motor de batalla y pantalla de resultado
- Objetivo: configurar combate y visualizar análisis.
- Entregable: `/battle/new`, `/battle/:id`, radar comparativo, comparación por categoría, probabilidad, dificultad, rondas y veredicto; ficha `/character/:slug`.

### Fase 3: IA real, cache, historial y rankings
- Objetivo: análisis con OpenAI persistido.
- Entregable: Edge Function `battle-simulate`, validación de JSON, cache por hash, `/history`, `/rankings`.

### Fase 4: Admin y generación con IA
- Objetivo: gestionar el catálogo sin tocar código.
- Entregable: `/admin` con CRUD, búsqueda y "Generate with AI" con aprobación PENDING REVIEW.