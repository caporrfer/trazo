import type { AdminProposal, AdminResponse, ProposalPublic } from "./types";

export const demoProposal: ProposalPublic = {
  id: "11111111-1111-4111-8111-111111111111",
  businessName: "Restaurante Paco",
  businessType: "Restaurante",
  slug: "restaurante-paco",
  token: "demo-seguro-trazo-2026",
  demoUrl: "https://example.com",
  active: true,
  formVersion: 1,
};

export const demoAdminProposals: AdminProposal[] = [
  {
    ...demoProposal,
    stage: "sent",
    commercialStatus: "pending_contact",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    nextContactAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    responseCount: 2,
    unreadCount: 1,
  },
  {
    ...demoProposal,
    id: "22222222-2222-4222-8222-222222222222",
    businessName: "Café Nube",
    slug: "cafe-nube",
    token: "demo-cafe-nube-2026",
    stage: "prepared",
    commercialStatus: "unclassified",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    responseCount: 0,
    unreadCount: 0,
  },
];

export const demoAdminResponses: AdminResponse[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    proposalId: demoProposal.id,
    businessName: demoProposal.businessName,
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    intent: "changes",
    impression: "changes",
    plan: "updates",
    respondentName: "María",
    contactMethod: "whatsapp",
    contactValue: "+34 600 000 000",
    unread: true,
    followupStatus: "pending",
    answers: {
      viewed: "reviewed",
      impression: "changes",
      changes: ["photos", "menu"],
      changesNote:
        "Actualizaríamos las fotos del comedor y la carta de temporada.",
      intent: "changes",
      goal: "reservations",
      plan: "updates",
      domainStatus: "wanted",
      desiredDomains: ["restaurantepaco.es", "casapaco.es"],
      respondentName: "María",
      relationship: "manager",
      decisionRole: "shared",
      contactMethod: "whatsapp",
      contactValue: "+34 600 000 000",
      contactTime: "afternoon",
    },
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    proposalId: demoProposal.id,
    businessName: demoProposal.businessName,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    intent: "opinion",
    impression: "like",
    unread: false,
    followupStatus: "none",
    answers: {
      viewed: "skimmed",
      impression: "like",
      changes: [],
      desiredDomains: [],
      intent: "opinion",
    },
  },
];
