import { NextRequest, NextResponse } from "next/server";
import { submitProposalResponse } from "@/lib/proposal-submission";
import { getPublicProposal } from "@/lib/repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const proposal = await getPublicProposal(slug);
  if (!proposal)
    return NextResponse.json(
      { message: "Esta propuesta ya no está disponible." },
      { status: 404 },
    );
  return submitProposalResponse(request, proposal);
}
