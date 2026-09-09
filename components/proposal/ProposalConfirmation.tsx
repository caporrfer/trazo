"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { confirmationCopy, optionLabels } from "@/lib/content";
import { proposalPath } from "@/lib/proposal-url";
import type { ContactMethod, Intent, ProposalPublic } from "@/lib/types";

export function ProposalConfirmation({
  proposal,
}: {
  proposal: ProposalPublic;
}) {
  const [details, setDetails] = useState<{
    intent?: Intent;
    contactMethod?: ContactMethod;
  }>({});
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const saved = sessionStorage.getItem(`trazo:confirmation:${proposal.id}`);
    if (saved) queueMicrotask(() => setDetails(JSON.parse(saved)));
  }, [proposal.id]);
  const contact =
    details.contactMethod && details.contactMethod !== "relay"
      ? optionLabels.contactMethod[details.contactMethod]
      : undefined;
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Brand />
        <p className="eyebrow">Respuesta recibida</p>
        <h1>Gracias por contarnos qué piensas, {proposal.businessName}.</h1>
        <p className="lead">{confirmationCopy(details.intent, contact)}</p>
        <div className="home-note">
          <strong>¿Quieres enseñársela a otra persona?</strong>
          <span>
            Puedes compartir el mismo enlace: cada respuesta se guardará por
            separado.
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
          <a
            className="button button-primary"
            href={proposal.demoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Volver a abrir la demo <ExternalLink size={20} aria-hidden="true" />
          </a>
          <button
            className="button button-secondary"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${location.origin}${proposalPath(proposal.slug)}`,
              );
              setCopied(true);
            }}
          >
            {copied ? "Enlace copiado" : "Copiar enlace"}{" "}
            {copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </main>
  );
}
