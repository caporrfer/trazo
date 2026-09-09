import { notFound } from "next/navigation";
import { getPublicProposal } from "@/lib/repository";
import { Confirmation } from "./Confirmation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Respuesta recibida",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const proposal = await getPublicProposal(slug, token);
  if (!proposal) notFound();
  return <Confirmation proposal={proposal} />;
}
