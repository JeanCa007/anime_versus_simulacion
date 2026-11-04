import { difficultyTone, normalizeDifficulty } from '@/lib/battleCategories';

interface DifficultyBadgeProps {
  difficulty: string | null | undefined;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export default function DifficultyBadge({ difficulty, size = 'md', showIcon = true }: DifficultyBadgeProps) {
  const label = normalizeDifficulty(difficulty);
  const tone = difficultyTone(difficulty);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-label uppercase ${tone} ${
        size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
      }`}
    >
      {showIcon && <i className="ri-pulse-line text-xs" />}
      {label}
    </span>
  );
}