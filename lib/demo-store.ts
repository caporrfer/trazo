import { demoAdminResponses } from "./demo-data";
import type { AdminResponse, FormAnswers, ProposalPublic } from "./types";

declare global {
  var __trazoDemoResponses: AdminResponse[] | undefined;
}

export function demoResponses() {
  if (!globalThis.__trazoDemoResponses)
    globalThis.__trazoDemoResponses = structuredClone(demoAdminResponses);
  return globalThis.__trazoDemoResponses;
}

export function addDemoResponse(
  proposal: ProposalPublic,
  answers: FormAnswers,
) {
  const item: AdminResponse = {
    id: crypto.randomUUID(),
    proposalId: proposal.id,
    businessName: proposal.businessName,
    createdAt: new Date().toISOString(),
    intent: answers.intent || "opinion",
    impression: answers.impression,
    plan: answers.plan,
    respondentName: answers.respondentName,
    contactMethod: answers.contactMethod,
    contactValue: answers.contactValue,
    unread: true,
    followupStatus: ["information", "changes", "talk", "demo_help"].includes(
      answers.intent || "",
    )
      ? "pending"
      : "none",
    answers,
  };
  demoResponses().unshift(item);
  return item;
}
