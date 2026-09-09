import "server-only";

import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addDemoResponse } from "@/lib/demo-store";
import { sanitizeForFlow } from "@/lib/flow";
import { hasSupabaseConfig, isDemoMode } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/server";
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
  if (!hasSupabaseConfig() || !process.env.RATE_LIMIT_SECRET)
    return NextResponse.json(
      {
        message:
          "El formulario no está configurado temporalmente. Inténtalo más tarde.",
      },
      { status: 503 },
    );
  const { data, error } = await createServiceClient().rpc(
    "submit_proposal_response",
    {
      p_proposal_id: proposal.id,
      p_request_id: parsed.data.requestId,
      p_form_version: parsed.data.formVersion,
      p_payload: answers,
      p_ip_hash: ipHash,
    },
  );
  if (error) {
    const status = error.message.includes("RATE_LIMIT")
      ? 429
      : error.message.includes("INACTIVE") ||
          error.message.includes("FORM_VERSION")
        ? 409
        : 500;
    return NextResponse.json(
      {
        message:
          status === 429
            ? "Hemos recibido varios intentos seguidos. Espera unos minutos y vuelve a intentarlo."
            : status === 409
              ? "Esta propuesta ya no admite respuestas."
              : "No hemos podido guardar la respuesta. Tu borrador sigue aquí; inténtalo de nuevo.",
      },
      { status },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
