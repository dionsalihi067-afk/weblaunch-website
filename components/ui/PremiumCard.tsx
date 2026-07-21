import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article';
};

export default function PremiumCard({
  children,
  className,
  hover = true,
  as: Tag = 'div',
}: PremiumCardProps) {
  return (
    <Tag
      className={clsx(
        'surface-card relative h-full card-glow',
        hover && 'surface-card-hover',
        'perspective-scene group',
        className
      )}
    >
      <div className="relative h-full depth-layer">{children}</div>
    </Tag>
  );
}
