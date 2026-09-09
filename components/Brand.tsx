import Link from "next/link";

export function Brand({
  href,
  compact = false,
  inverse = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  const classes = [
    "brand",
    compact ? "brand-compact" : "",
    inverse ? "brand-inverse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M8 18c8-2 22-2 32 1-8 1-14-1-16-6-1.5-4 1-7 4-5 4 3-1 11-3 17-2 7-3 14 1 17 4 4 11 2 15-2" />
          <circle cx="39" cy="11" r="2.6" />
        </svg>
      </span>
      <span className="brand-word">Trazo</span>
    </>
  );
  return href ? (
    <Link className={classes} href={href} aria-label="Trazo, inicio">
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
