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

export interface ManagedDomain {
  id: string;
  websiteId: string;
  name: string;
  provider?: string;
  contractedOn?: string;
  nextRenewalOn?: string;
  autoRenew: boolean;
  renewalStatus: "active" | "soon" | "today" | "overdue" | "unknown";
  daysToRenewal?: number;
  lastCostCents?: number;
  events?: DomainEvent[];
}

export interface DomainEvent {
  id: string;
  eventType: "purchase" | "renewal" | "other";
  eventDate: string;
  provider?: string;
  amountCents?: number;
  notes?: string;
  fileId?: string;
  fileName?: string;
}

export interface MaintenancePayment {
  id: string;
  paidOn: string;
  amountCents: number;
  periodStart: string;
  monthsCovered: number;
  notes?: string;
  voidedAt?: string;
}

export interface ManagedWebsite {
  id: string;
  businessId?: string;
  proposalId?: string;
  businessName: string;
  websiteUrl?: string;
  activatedOn?: string;
  deactivatedOn?: string;
  maintenanceMonthlyCents?: number;
  notes?: string;
  archived: boolean;
  domainCount: number;
  domains: ManagedDomain[];
  payments: MaintenancePayment[];
  activeDays?: number;
  completeMonths?: number;
  remainingDays?: number;
  paidMonths: number;
  pendingMonths: number;
  totalPaidCents: number;
}
