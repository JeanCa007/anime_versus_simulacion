import { ARCHETYPE_GRADIENTS, getInitials } from '@/lib/stats';

interface CharacterAvatarProps {
  name: string;
  image?: string | null;
  archetype?: string;
  rounded?: string;
  className?: string;
  textClassName?: string;
}

export default function CharacterAvatar({
  name,
  image,
  archetype = 'balanced',
  rounded = 'rounded-xl',
  className = 'h-14 w-14',
  textClassName = 'text-lg',
}: CharacterAvatarProps) {
  const gradient = ARCHETYPE_GRADIENTS[archetype] ?? ARCHETYPE_GRADIENTS.balanced;

  return (
    <div className={`relative shrink-0 overflow-hidden border border-background-700 ${rounded} ${className}`}>
      {image ? (
        <img
          src={image}
          alt={`Retrato de ${name}`}
          title={`${name} - personaje de anime`}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className={`font-heading font-bold tracking-tight text-foreground-100 ${textClassName}`}>
            {getInitials(name)}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-950/85 via-background-950/5 to-transparent" />
    </div>
  );
}