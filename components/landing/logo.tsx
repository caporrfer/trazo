import Link from 'next/link';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`brand${inverse ? ' brand--inverse' : ''}`} href="/" aria-label="Trazo, inicio">
      <span>trazo</span>
      <svg viewBox="0 0 72 12" aria-hidden="true">
        <path d="M2 9C17 9 18 2 32 3c12 1 15 7 38 2" />
      </svg>
    </Link>
  );
}
