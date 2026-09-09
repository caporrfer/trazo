import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalForm } from "@/components/proposal/ProposalForm";
import { getPublicProposal } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}): Promise<Metadata> {
  const { slug, token } = await params;
  const proposal = await getPublicProposal(slug, token);
  return {
    title: proposal
      ? `Propuesta para ${proposal.businessName}`
      : "Propuesta no disponible",
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const proposal = await getPublicProposal(slug, token);
  if (!proposal) notFound();
  return <ProposalForm proposal={proposal} />;
}
