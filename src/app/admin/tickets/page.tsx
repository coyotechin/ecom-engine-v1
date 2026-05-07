import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminNavigation } from "@/config/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

type OnboardingTicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  business_name: string;
  business_category: string | null;
  business_location: string | null;
  selected_engine: EngineType;
  ticket_source: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  follow_up_date: string | null;
  requirement_details: string | null;
  internal_notes: string | null;
  created_at: string;
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

export default async function AdminTicketsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onboarding_tickets")
    .select(
      "id, ticket_code, customer_name, mobile_number, email, business_name, business_category, business_location, selected_engine, ticket_source, priority, status, setup_cost, revenue_share_percentage, follow_up_date, requirement_details, internal_notes, created_at",
    )
    .order("created_at", { ascending: false });

  const tickets = (data || []) as OnboardingTicketRow[];

  const ticketMetrics = [
    {
      label: "Total Tickets",
      value: String(tickets.length),
      helperText: "Onboarding enquiries saved in Supabase.",
    },
    {
      label: "High Priority",
      value: String(
        tickets.filter((ticket) => ticket.priority === "high").length,
      ),
      helperText: "Tickets requiring faster CYT executive action.",
    },
    {
      label: "Retail Engine",
      value: String(
        tickets.filter((ticket) => ticket.selected_engine === "retail").length,
      ),
      helperText: "Customers interested in product, POS, inventory, and orders.",
    },
    {
      label: "Pending Follow-ups",
      value: String(
        tickets.filter((ticket) => ticket.follow_up_date !== null).length,
      ),
      helperText: "Tickets with follow-up dates assigned.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Ticket Management"
      description="Create, view, update, and track onboarding enquiries from first contact to live customer and revenue monitoring."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Admin Module</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Onboarding Tickets
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This screen reads onboarding tickets directly from Supabase. CYT
              Nexus executives can use it to track enquiries, requirements,
              commercial discussions, access creation, setup progress, and store
              launch status.
            </p>
          </div>

          <Button href="/admin/tickets/create" variant="primary">
            Create Ticket
          </Button>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load tickets
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ticketMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Ticket List</CardTitle>
            <CardDescription>
              Live data from Supabase PostgreSQL. New tickets created from the
              Create Ticket form will appear here.
            </CardDescription>
          </CardHeader>

          {tickets.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-black">
                No tickets found
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create your first onboarding enquiry to start tracking customer
                requirements, engine selection, commercial terms, and launch
                status.
              </p>

              <div className="mt-6">
                <Button href="/admin/tickets/create" variant="primary">
                  Create First Ticket
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Ticket
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Customer
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Business
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Engine
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Commercials
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Follow-up
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {ticket.ticket_code}
                          </p>
                          <div className="mt-2">
                            <Badge
                              variant={getPriorityVariant(ticket.priority)}
                            >
                              {formatPriority(ticket.priority)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">
                            Created: {formatDate(ticket.created_at)}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {ticket.customer_name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {ticket.mobile_number}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {ticket.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {ticket.business_name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {ticket.business_category || "No category"}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {ticket.business_location || "No location"}
                          </p>
                          <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                            {ticket.requirement_details ||
                              ticket.internal_notes ||
                              "No notes added"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-medium text-black">
                            {formatEngine(ticket.selected_engine)}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Source: {ticket.ticket_source || "Not set"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {formatCurrency(ticket.setup_cost)}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Revenue share:{" "}
                            {ticket.revenue_share_percentage || 0}%
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <Badge variant={getStatusVariant(ticket.status)}>
                            {formatStatus(ticket.status)}
                          </Badge>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-medium text-black">
                            {formatDate(ticket.follow_up_date)}
                          </p>

                          <Link
                            href={`/admin/tickets/${ticket.id}`}
                            className="mt-3 inline-flex rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-black hover:text-black"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}