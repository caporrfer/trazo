import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalForm } from "@/components/proposal/ProposalForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminProposal } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vista previa de propuesta",
  robots: { index: false, follow: false },
};

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const proposal = await getAdminProposal(id);
  if (!proposal?.slug || !proposal.demoUrl) notFound();
  return <ProposalForm proposal={{ ...proposal, active: true }} preview />;
}
