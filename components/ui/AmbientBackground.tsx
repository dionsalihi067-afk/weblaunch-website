import { clsx } from 'clsx';

type AmbientBackgroundProps = {
  variant?: 'light' | 'dark' | 'hero';
  className?: string;
};

/**
 * CSS-only depth layers — decorative, non-interactive, SEO-safe.
 */
export default function AmbientBackground({
  variant = 'light',
  className,
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
    >
      {variant === 'hero' && (
        <>
          <div className="absolute inset-0 bg-mesh" />
          <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)]" />
          <div className="absolute -top-20 right-[4%] h-56 w-56 rounded-full bg-primary-400/25 blur-3xl animate-pulse-soft motion-reduce:animate-none sm:-top-28 sm:right-[6%] sm:h-[32rem] sm:w-[32rem]" />
          <div className="absolute top-[18%] left-[8%] h-40 w-40 rounded-full bg-sky-300/20 blur-3xl animate-float-slow motion-reduce:animate-none sm:left-[12%] sm:h-64 sm:w-64" />
          <div className="absolute bottom-[-4rem] left-[2%] h-48 w-48 rounded-full bg-primary-300/15 blur-3xl animate-float-slow motion-reduce:animate-none [animation-delay:1.2s] sm:bottom-[-8rem] sm:left-[4%] sm:h-[26rem] sm:w-[26rem]" />
          <div
            className="absolute top-[26%] right-[10%] hidden md:block h-40 w-40 rounded-[1.75rem] border border-white/50 bg-white/20 shadow-glow backdrop-blur-md animate-float-slow motion-reduce:animate-none"
            style={{ transform: 'rotateX(14deg) rotateY(-18deg)', transformStyle: 'preserve-3d' }}
          />
          <div
            className="absolute bottom-[20%] left-[8%] hidden lg:block h-28 w-28 rounded-2xl border border-sky-200/50 bg-gradient-to-br from-white/30 to-primary-100/20 backdrop-blur-sm animate-float-slow motion-reduce:animate-none [animation-delay:1.8s]"
            style={{ transform: 'rotateX(-10deg) rotateY(16deg)', transformStyle: 'preserve-3d' }}
          />
        </>
      )}

      {variant === 'light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-200/15 blur-3xl" />
        </>
      )}

      {variant === 'dark' && (
        <>
          <div className="absolute inset-0 bg-mesh-dark" />
          <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-primary-500/25 blur-3xl animate-pulse-soft motion-reduce:animate-none" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        </>
      )}
    </div>
  );
}
