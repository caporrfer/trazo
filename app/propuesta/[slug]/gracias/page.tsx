import { notFound } from "next/navigation";
import { ProposalConfirmation } from "@/components/proposal/ProposalConfirmation";
import { getPublicProposal } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Respuesta recibida",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proposal = await getPublicProposal(slug);
  if (!proposal) notFound();
  return <ProposalConfirmation proposal={proposal} />;
}
