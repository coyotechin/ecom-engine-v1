export type EngineType =
  | "Retail Commerce Engine"
  | "Learning Commerce Engine"
  | "Event Commerce Engine";

export type TicketStatus =
  | "New Enquiry"
  | "Requirement Collected"
  | "Engine Suggested"
  | "Commercial Discussion"
  | "Approved"
  | "Access Created"
  | "Setup in Progress"
  | "Live"
  | "Revenue Monitoring"
  | "On Hold"
  | "Rejected";

export type TicketPriority = "Low" | "Medium" | "High";

export type OnboardingTicket = {
  ticketId: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  businessCategory: string;
  selectedEngine: EngineType;
  ticketSource: string;
  assignedExecutive: string;
  setupCost: string;
  revenueShare: string;
  status: TicketStatus;
  priority: TicketPriority;
  followUpDate: string;
  notes: string;
};