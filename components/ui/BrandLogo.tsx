import Image from 'next/image';
import { clsx } from 'clsx';

type BrandLogoProps = {
  variant?: 'color' | 'white';
  className?: string;
  priority?: boolean;
};

/**
 * Transparent brand mark — no box, no fill, natural blend on any surface.
 */
export default function BrandLogo({
  variant = 'color',
  className,
  priority = false,
}: BrandLogoProps) {
  const src = variant === 'white' ? '/assets/logo-white.png' : '/assets/logo.png';

  return (
    <span
      className={clsx(
        'logo-frame relative inline-flex items-center justify-start',
        'h-9 w-32 sm:h-12 sm:w-40',
        className
      )}
    >
      <Image
        src={src}
        alt="WEB LAUNCH"
        fill
        priority={priority}
        sizes="(max-width: 640px) 128px, 160px"
        quality={85}
        className="logo-image object-contain object-left"
      />
    </span>
  );
}
