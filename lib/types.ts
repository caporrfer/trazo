export type ViewedDraft = "reviewed" | "skimmed" | "not_yet";
export type Impression =
  | "like"
  | "changes"
  | "more_info"
  | "no_fit"
  | "no_need";
export type FitClarification = "new_approach" | "finish";
export type Intent =
  | "information"
  | "changes"
  | "talk"
  | "share"
  | "opinion"
  | "demo_help"
  | "decline";
export type Goal =
  | "reservations"
  | "menu"
  | "orders"
  | "messages"
  | "image"
  | "google"
  | "advice";
export type Plan = "hosting" | "updates" | "development" | "advice" | "not_yet";
export type DomainStatus = "existing" | "wanted" | "help" | "undecided";
export type Relationship =
  | "owner"
  | "manager"
  | "marketing"
  | "staff"
  | "other";
export type DecisionRole = "decision" | "shared" | "relay" | "unsure";
export type ContactMethod = "whatsapp" | "phone" | "email" | "relay";
export type ContactTime =
  | "morning"
  | "afternoon"
  | "anytime"
  | "specific"
  | "write_first";
export type DeclineReason =
  | "has_site"
  | "not_priority"
  | "style"
  | "not_useful"
  | "price"
  | "other"
  | "prefer_not";

export interface ProposalPublic {
  id: string;
  businessName: string;
  businessType: string;
  slug: string;
  demoUrl: string;
  active: boolean;
  formVersion: number;
}

export interface FormAnswers {
  viewed?: ViewedDraft;
  impression?: Impression;
  fitClarification?: FitClarification;
  changes: string[];
  changesNote?: string;
  intent?: Intent;
  goal?: Goal;
  plan?: Plan;
  domainStatus?: DomainStatus;
  currentDomain?: string;
  desiredDomains: string[];
  respondentName?: string;
  relationship?: Relationship;
  decisionRole?: DecisionRole;
  contactMethod?: ContactMethod;
  contactValue?: string;
  contactTime?: ContactTime;
  preferredDateTime?: string;
  declineReason?: DeclineReason;
  declineNote?: string;
  relayEmail?: string;
}

export interface SubmissionPayload {
  requestId: string;
  formVersion: number;
  answers: FormAnswers;
  company?: string;
}

export type ProposalStage = "draft" | "prepared" | "sent" | "archived";
export type CommercialStatus =
  | "unclassified"
  | "pending_contact"
  | "contacted"
  | "waiting"
  | "interested"
  | "client"
  | "not_interested";

export interface AdminProposal extends ProposalPublic {
  stage: ProposalStage;
  commercialStatus: CommercialStatus;
  createdAt: string;
  sentAt?: string;
  nextContactAt?: string;
  responseCount: number;
  unreadCount: number;
  knownContactName?: string;
  knownContactEmail?: string;
  knownContactPhone?: string;
}

export interface AdminResponse {
  id: string;
  proposalId: string;
  businessName: string;
  createdAt: string;
  intent: Intent;
  impression?: Impression;
  plan?: Plan;
  respondentName?: string;
  contactMethod?: ContactMethod;
  contactValue?: string;
  unread: boolean;
  followupStatus: "none" | "pending" | "attended";
  answers: FormAnswers;
}
