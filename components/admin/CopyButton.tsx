"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label,
  icon,
}: {
  text: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="button button-secondary"
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {icon}
      {copied ? "Copiado" : label}
    </button>
  );
}
