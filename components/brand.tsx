import { ArrowUpRight } from 'lucide-react';

export const DRAFT_HREF = '/empezar/';

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <a className={`wordmark ${className}`} href="/" aria-label="Trazo, inicio">
      tra<span>z</span>o
      <span className="brand-dot" aria-hidden="true">
        .
      </span>
    </a>
  );
}

export function Trace({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`trace ${className}`}
      viewBox="0 0 470 68"
      fill="none"
      aria-hidden="true"
    >
      <path
        pathLength="1"
        d="M5 49C100 12 290 10 444 17C471 18 472 28 439 31C343 41 223 45 172 57"
      />
    </svg>
  );
}

export function DraftCta({
  tone = 'dark',
  compact = false,
}: {
  tone?: 'dark' | 'light';
  compact?: boolean;
}) {
  return (
    <div className={`cta-group${compact ? ' cta-compact' : ''}`}>
      <a className={`cta cta-${tone}`} href={DRAFT_HREF} data-draft-cta>
        <span>Solicitar mi borrador gratis</span>
        <span className="cta-arrow">
          <ArrowUpRight aria-hidden="true" />
        </span>
      </a>
      <span className="cta-notice">Cuestionario próximamente</span>
    </div>
  );
}

export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="section-label">
      <span>{number} /</span> {children}
    </p>
  );
}
