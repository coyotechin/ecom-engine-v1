import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminNavigation } from "@/config/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TicketDetailPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

type TicketStatus =
  | "new_enquiry"
  | "requirement_collected"
  | "engine_suggested"
  | "commercial_discussion"
  | "approved"
  | "access_created"
  | "setup_in_progress"
  | "live"
  | "revenue_monitoring"
  | "on_hold"
  | "rejected";

type TicketPriority = "low" | "medium" | "high";
type EngineType = "retail" | "learning" | "event";

type TicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  customer_address: string | null;
  business_name: string;
  business_category: string | null;
  business_location: string | null;
  current_sales_method: string | null;
  selected_engine: EngineType;
  ticket_source: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  agreement_period: string | null;
  follow_up_date: string | null;
  expected_launch_date: string | null;
  requirement_details: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

function formatStatus(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    new_enquiry: "New Enquiry",
    requirement_collected: "Requirement Collected",
    engine_suggested: "Engine Suggested",
    commercial_discussion: "Commercial Discussion",
    approved: "Approved",
    access_created: "Access Created",
    setup_in_progress: "Setup in Progress",
    live: "Live",
    revenue_monitoring: "Revenue Monitoring",
    on_hold: "On Hold",
    rejected: "Rejected",
  };

  return labels[status];
}

function formatPriority(priority: TicketPriority) {
  const labels: Record<TicketPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return labels[priority];
}

function formatEngine(engine: EngineType) {
  const labels: Record<EngineType, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[engine];
}

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusVariant(status: TicketStatus) {
  if (status === "live" || status === "revenue_monitoring") {
    return "dark" as const;
  }

  if (
    status === "commercial_discussion" ||
    status === "approved" ||
    status === "access_created"
  ) {
    return "outline" as const;
  }

  return "muted" as const;
}

function getPriorityVariant(priority: TicketPriority) {
  if (priority === "high") {
    return "dark" as const;
  }

  if (priority === "medium") {
    return "outline" as const;
  }

  return "muted" as const;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-black">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { ticketId } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onboarding_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error || !data) {
    notFound();
  }

  const ticket = data as TicketRow;

  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Ticket Detail"
      description="View complete onboarding enquiry details, requirement information, commercial terms, follow-up data, and workflow status."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">{ticket.ticket_code}</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {ticket.business_name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This ticket is connected to Supabase and represents a real CYT
              Nexus onboarding enquiry.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Badge variant={getStatusVariant(ticket.status)}>
                {formatStatus(ticket.status)}
              </Badge>

              <Badge variant={getPriorityVariant(ticket.priority)}>
                {formatPriority(ticket.priority)} Priority
              </Badge>

              <Badge variant="outline">{formatEngine(ticket.selected_engine)}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/admin/tickets" variant="outline">
              Back to Tickets
            </Button>

            <Button variant="primary">Edit Ticket</Button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>
                  Contact information collected by CYT Nexus executive.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Customer Name" value={ticket.customer_name} />
                <DetailItem label="Mobile Number" value={ticket.mobile_number} />
                <DetailItem label="Email" value={ticket.email} />
                <DetailItem
                  label="Customer Address"
                  value={ticket.customer_address}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Business profile and current sales method.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Business Name" value={ticket.business_name} />
                <DetailItem
                  label="Business Category"
                  value={ticket.business_category}
                />
                <DetailItem
                  label="Business Location"
                  value={ticket.business_location}
                />
                <DetailItem
                  label="Current Sales Method"
                  value={ticket.current_sales_method}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Requirement Details</CardTitle>
                <CardDescription>
                  Business needs recorded during onboarding discussion.
                </CardDescription>
              </CardHeader>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm leading-7 text-neutral-700">
                  {ticket.requirement_details || "No requirement details added."}
                </p>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
                <CardDescription>
                  Private CYT Nexus notes for follow-up and execution.
                </CardDescription>
              </CardHeader>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm leading-7 text-neutral-700">
                  {ticket.internal_notes || "No internal notes added."}
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Commercial Terms</CardTitle>
                <CardDescription>
                  Setup cost, revenue share, and agreement information.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem
                  label="Setup Cost"
                  value={formatCurrency(ticket.setup_cost)}
                />
                <DetailItem
                  label="Revenue Share"
                  value={`${ticket.revenue_share_percentage || 0}%`}
                />
                <DetailItem
                  label="Agreement Period"
                  value={ticket.agreement_period}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Workflow Details</CardTitle>
                <CardDescription>
                  Status, source, follow-up, and expected launch information.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem label="Ticket Source" value={ticket.ticket_source} />
                <DetailItem label="Status" value={formatStatus(ticket.status)} />
                <DetailItem
                  label="Priority"
                  value={formatPriority(ticket.priority)}
                />
                <DetailItem
                  label="Follow-up Date"
                  value={formatDate(ticket.follow_up_date)}
                />
                <DetailItem
                  label="Expected Launch Date"
                  value={formatDate(ticket.expected_launch_date)}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>System Record</CardTitle>
                <CardDescription>
                  Supabase database record information.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem label="Record ID" value={ticket.id} />
                <DetailItem
                  label="Created At"
                  value={formatDateTime(ticket.created_at)}
                />
                <DetailItem
                  label="Updated At"
                  value={formatDateTime(ticket.updated_at)}
                />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}