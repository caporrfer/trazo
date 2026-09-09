import type { FormAnswers } from "./types";

export type StepId =
  | "viewed"
  | "demoHelp"
  | "impression"
  | "fit"
  | "changes"
  | "intent"
  | "goal"
  | "pricing"
  | "domain"
  | "person"
  | "contact"
  | "decline"
  | "review";

export function isDecline(answers: FormAnswers) {
  return (
    answers.impression === "no_need" ||
    (answers.impression === "no_fit" &&
      answers.fitClarification === "finish") ||
    answers.intent === "decline"
  );
}

export function requiresContact(answers: FormAnswers) {
  return ["demo_help", "information", "changes", "talk"].includes(
    answers.intent || "",
  );
}

export function wantsCommercialPath(answers: FormAnswers) {
  return ["information", "changes", "talk"].includes(answers.intent || "");
}

export function needsChanges(answers: FormAnswers) {
  return (
    answers.impression === "changes" ||
    answers.fitClarification === "new_approach" ||
    answers.intent === "changes"
  );
}

export function shouldAskDomain(answers: FormAnswers) {
  return (
    wantsCommercialPath(answers) && !!answers.plan && answers.plan !== "not_yet"
  );
}

export function buildSteps(answers: FormAnswers): StepId[] {
  const steps: StepId[] = ["viewed"];
  if (answers.viewed === "not_yet") {
    steps.push("demoHelp");
    if (answers.intent === "demo_help")
      return [...steps, "person", "contact", "review"];
    return steps;
  }
  if (!answers.viewed) return steps;
  steps.push("impression");
  if (!answers.impression) return steps;
  if (answers.impression === "no_fit") {
    steps.push("fit");
    if (!answers.fitClarification) return steps;
  }
  if (isDecline(answers)) return [...steps, "decline", "review"];
  if (needsChanges(answers)) steps.push("changes");
  steps.push("intent");
  if (!answers.intent) return steps;
  if (answers.intent === "opinion" || answers.intent === "share")
    return [...steps, "person", "review"];
  if (answers.intent === "decline") return [...steps, "decline", "review"];
  if (needsChanges(answers) && !steps.includes("changes"))
    steps.push("changes");
  if (wantsCommercialPath(answers)) steps.push("goal", "pricing");
  if (shouldAskDomain(answers)) steps.push("domain");
  steps.push("person");
  if (requiresContact(answers)) steps.push("contact");
  steps.push("review");
  return steps;
}

export function progressSection(step: StepId) {
  if (["viewed", "demoHelp", "impression", "fit", "changes"].includes(step))
    return 0;
  if (
    [
      "intent",
      "goal",
      "pricing",
      "domain",
      "person",
      "contact",
      "decline",
    ].includes(step)
  )
    return 1;
  return 2;
}

export function sanitizeForFlow(answers: FormAnswers): FormAnswers {
  const next = {
    ...answers,
    changes: [...answers.changes],
    desiredDomains: [...answers.desiredDomains],
  };
  if (!needsChanges(next)) {
    next.changes = [];
    next.changesNote = undefined;
  }
  if (!wantsCommercialPath(next)) {
    next.goal = undefined;
    next.plan = undefined;
    next.domainStatus = undefined;
    next.currentDomain = undefined;
    next.desiredDomains = [];
  }
  if (!shouldAskDomain(next)) {
    next.domainStatus = undefined;
    next.currentDomain = undefined;
    next.desiredDomains = [];
  }
  if (!requiresContact(next)) {
    next.contactMethod = undefined;
    next.contactValue = undefined;
    next.contactTime = undefined;
    next.preferredDateTime = undefined;
  }
  if (!isDecline(next)) {
    next.declineReason = undefined;
    next.declineNote = undefined;
  }
  if (isDecline(next)) {
    next.changes = [];
    next.changesNote = undefined;
    next.goal = undefined;
    next.plan = undefined;
    next.domainStatus = undefined;
    next.currentDomain = undefined;
    next.desiredDomains = [];
    next.respondentName = undefined;
    next.relationship = undefined;
    next.decisionRole = undefined;
    next.contactMethod = undefined;
    next.contactValue = undefined;
    next.contactTime = undefined;
    next.preferredDateTime = undefined;
    next.relayEmail = undefined;
  }
  if (next.intent !== "share") next.relayEmail = undefined;
  return next;
}
