import "server-only";

import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addDemoResponse } from "@/lib/demo-store";
import { sanitizeForFlow } from "@/lib/flow";
import { isDemoMode } from "@/lib/runtime-config";
import { createServiceClient } from "@/lib/data";
import type { ProposalPublic } from "@/lib/types";
import { submissionSchema } from "@/lib/validation";

interface DemoSubmissionState {
  attempts: Map<string, number[]>;
  submissions: Map<string, string>;
}

const globalDemoState = globalThis as typeof globalThis & {
  trazoDemoSubmissionState?: DemoSubmissionState;
};

const demoState: DemoSubmissionState =
  (globalDemoState.trazoDemoSubmissionState ||= {
    attempts: new Map<string, number[]>(),
    submissions: new Map<string, string>(),
  });

function clientHash(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHmac(
    "sha256",
    process.env.RATE_LIMIT_SECRET || "local-demo-secret",
  )
    .update(ip)
    .digest("hex");
}

function demoRateLimited(key: string) {
  const now = Date.now();
  const recent = (demoState.attempts.get(key) || []).filter(
    (time) => time > now - 10 * 60_000,
  );
  if (recent.length >= 10) return true;
  recent.push(now);
  demoState.attempts.set(key, recent);
  return false;
}

export async function submitProposalResponse(
  request: NextRequest,
  proposal: ProposalPublic,
) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return NextResponse.json(
      { message: "El formato enviado no es compatible." },
      { status: 415 },
    );
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64_000)
    return NextResponse.json(
      { message: "La respuesta es demasiado grande." },
      { status: 413 },
    );
  const origin = request.headers.get("origin");
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin;
  if (
    origin &&
    origin !== configuredOrigin &&
    origin !== request.nextUrl.origin
  )
    return NextResponse.json(
      { message: "Origen no permitido." },
      { status: 403 },
    );
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { message: "La respuesta no tiene un formato válido." },
      { status: 400 },
    );
  }
  const parsed = submissionSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message || "Revisa los campos indicados.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  if (parsed.data.formVersion !== proposal.formVersion)
    return NextResponse.json(
      {
        message:
          "La propuesta se ha actualizado. Recarga la página y revisa tus respuestas.",
      },
      { status: 409 },
    );
  const answers = sanitizeForFlow(parsed.data.answers);
  const ipHash = clientHash(request);
  if (isDemoMode()) {
    const submissionKey = `${proposal.id}:${parsed.data.requestId}`;
    const existingId = demoState.submissions.get(submissionKey);
    if (existingId)
      return NextResponse.json(
        { id: existingId, duplicate: true },
        { status: 200 },
      );
    if (demoRateLimited(`${proposal.id}:${ipHash}`))
      return NextResponse.json(
        {
          message:
            "Hemos recibido varios intentos seguidos. Espera unos minutos y vuelve a intentarlo.",
        },
        { status: 429 },
      );
    const saved = addDemoResponse(proposal, answers);
    demoState.submissions.set(submissionKey, saved.id);
    return NextResponse.json(
      { id: saved.id, duplicate: false },
      { status: 201 },
    );
  }
  if (!process.env.RATE_LIMIT_SECRET)
    return NextResponse.json({ message: "El formulario no está configurado temporalmente. Inténtalo más tarde." }, { status: 503 });
  const client = createServiceClient();
  const existing = await client.from("responses").select("id").eq("proposal_id", proposal.id).eq("request_id", parsed.data.requestId).maybeSingle();
  if (existing.data?.id) return NextResponse.json({ id: existing.data.id, duplicate: true }, { status: 200 });
  const id = crypto.randomUUID();
  const saved = await client.from("responses").insert({ id, proposal_id: proposal.id, request_id: parsed.data.requestId, form_version: parsed.data.formVersion, answers: JSON.stringify(answers), intent: answers.intent || "information", impression: answers.impression || null, goal: answers.goal || null, selected_plan: answers.plan || null, respondent_name: answers.respondentName || null, relationship: answers.relationship || null, decision_role: answers.decisionRole || null, decline_reason: answers.declineReason || null, is_read: 0, followup_status: "none", created_at: new Date().toISOString() });
  if (saved.error) return NextResponse.json({ message: "No hemos podido guardar la respuesta. Tu borrador sigue aquí; inténtalo de nuevo." }, { status: 500 });
  if (answers.contactMethod) await client.from("response_contacts").insert({ response_id: id, method: answers.contactMethod, contact_value: answers.contactValue || null, preferred_time: answers.contactTime || null, preferred_datetime: answers.preferredDateTime || null, relay_email: answers.relayEmail || null });
  if (answers.domainStatus) await client.from("domain_preferences").insert({ response_id: id, status: answers.domainStatus, current_domain: answers.currentDomain || null, desired_domains: JSON.stringify(answers.desiredDomains || []) });
  for (const category of answers.changes || []) await client.from("response_changes").insert({ response_id: id, category });
  return NextResponse.json({ id, duplicate: false }, { status: 201 });
}
