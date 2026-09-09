import { NextResponse } from "next/server";
import { proposalConfirmationPath } from "@/lib/proposal-url";
import { getLegacyPublicProposal } from "@/lib/repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; token: string }> },
) {
  const { slug, token } = await params;
  const proposal = await getLegacyPublicProposal(slug, token);
  if (!proposal)
    return new NextResponse("Propuesta no disponible", { status: 404 });
  return NextResponse.redirect(
    new URL(proposalConfirmationPath(proposal.slug), request.url),
    308,
  );
}
