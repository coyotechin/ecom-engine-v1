import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ticket Management | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus ticket management page for Ecom Engine v.1 onboarding enquiries, engine selection, commercial discussion, access creation, setup progress, and revenue monitoring.",
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

  return labels[status] || status;
}

function formatPriority(priority: TicketPriority) {
  const labels: Record<TicketPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return labels[priority] || priority;
}

function formatEngine(engine: EngineType) {
  const labels: Record<EngineType, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[engine] || engine;
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

function getStatusClass(status: TicketStatus) {
  if (status === "live" || status === "revenue_monitoring") {
    return "border-black bg-black text-white";
  }

  if (
    status === "commercial_discussion" ||
    status === "approved" ||
    status === "access_created" ||
    status === "setup_in_progress"
  ) {
    return "border-neutral-400 bg-white text-black";
  }

  if (status === "rejected" || status === "on_hold") {
    return "border-neutral-300 bg-neutral-100 text-neutral-600";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function getPriorityClass(priority: TicketPriority) {
  if (priority === "high") {
    return "border-black bg-black text-white";
  }

  if (priority === "medium") {
    return "border-neutral-400 bg-white text-black";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function AdminButton({
  href,
  children,
  variant = "primary",
  size = "md",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white font-semibold text-black transition hover:border-black hover:bg-neutral-50 ${sizeClass}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{ color: "#FFFFFF" }}
      className={`inline-flex items-center justify-center rounded-full border border-black bg-black font-semibold transition hover:bg-neutral-800 ${sizeClass}`}
    >
      {children}
    </Link>
  );
}

function StatusBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  helperText,
}: {
  label: string;
  value: string;
  helperText: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-600">{helperText}</p>
    </div>
  );
}

export default async function HiddenAdminTicketsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onboarding_tickets")
    .select(
      "id, ticket_code, customer_name, mobile_number, email, business_name, business_category, business_location, selected_engine, ticket_source, priority, status, setup_cost, revenue_share_percentage, follow_up_date, requirement_details, internal_notes, created_at",
    )
    .order("created_at", { ascending: false });

  const tickets = (data || []) as OnboardingTicketRow[];

  const totalTickets = tickets.length;
  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "high",
  ).length;
  const retailTickets = tickets.filter(
    (ticket) => ticket.selected_engine === "retail",
  ).length;
  const learningTickets = tickets.filter(
    (ticket) => ticket.selected_engine === "learning",
  ).length;
  const eventTickets = tickets.filter(
    (ticket) => ticket.selected_engine === "event",
  ).length;
  const pendingFollowUps = tickets.filter(
    (ticket) =>
      ticket.follow_up_date !== null &&
      ticket.status !== "live" &&
      ticket.status !== "revenue_monitoring" &&
      ticket.status !== "rejected",
  ).length;
  const approvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "approved" ||
      ticket.status === "access_created" ||
      ticket.status === "setup_in_progress" ||
      ticket.status === "live" ||
      ticket.status === "revenue_monitoring",
  ).length;
  const estimatedSetupValue = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.setup_cost || 0),
    0,
  );

  const ticketMetrics = [
    {
      label: "Total Tickets",
      value: String(totalTickets),
      helperText: "All onboarding enquiries created by CYT executives.",
    },
    {
      label: "High Priority",
      value: String(highPriorityTickets),
      helperText: "Tickets requiring immediate commercial or onboarding action.",
    },
    {
      label: "Pending Follow-ups",
      value: String(pendingFollowUps),
      helperText: "Tickets with active follow-up requirement.",
    },
    {
      label: "Approved / Active",
      value: String(approvedTickets),
      helperText: "Tickets that moved into approval, access, setup, or live stage.",
    },
    {
      label: "Retail Engine",
      value: String(retailTickets),
      helperText: "Retail commerce enquiries for products, inventory, billing, and POS.",
    },
    {
      label: "Learning Engine",
      value: String(learningTickets),
      helperText: "Learning commerce enquiries for programs, students, and course sales.",
    },
    {
      label: "Event Engine",
      value: String(eventTickets),
      helperText: "Event commerce enquiries for shows, tickets, entries, and bookings.",
    },
    {
      label: "Setup Value",
      value: formatCurrency(estimatedSetupValue),
      helperText: "Estimated setup commercial value from ticket records.",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/admin/cytnexus.com/dashboard"
            className="inline-flex flex-col"
          >
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>

            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Hidden Admin Ticket Management
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets/create">
              Create Ticket
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/dashboard" variant="secondary">
              Dashboard
            </AdminButton>

            <AdminButton href="/" variant="secondary">
              Home
            </AdminButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              CYT Executive Exclusive
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Onboarding Tickets
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Create, view, update, and track onboarding enquiries from first
              customer contact to requirement collection, engine selection,
              commercial discussion, access creation, setup progress, live
              launch, and revenue monitoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets/create">
              Create Ticket
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/client-access" variant="secondary">
              Client Access
            </AdminButton>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load tickets
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ticketMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Ticket List
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Live onboarding enquiries
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                New tickets created from the hidden admin Create Ticket form
                will appear here. All action buttons are styled to avoid black
                text on black background.
              </p>
            </div>

            <AdminButton href="/admin/cytnexus.com/tickets/create" variant="secondary">
              Create New Ticket
            </AdminButton>
          </div>

          {tickets.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                No tickets found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create your first onboarding enquiry to start tracking customer
                requirements, engine selection, commercial terms, and launch
                status.
              </p>

              <div className="mt-6">
                <AdminButton href="/admin/cytnexus.com/tickets/create">
                  Create First Ticket
                </AdminButton>
              </div>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] border-collapse text-left">
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
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="transition hover:bg-neutral-50">
                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {ticket.ticket_code}
                          </p>

                          <div className="mt-2">
                            <StatusBadge className={getPriorityClass(ticket.priority)}>
                              {formatPriority(ticket.priority)}
                            </StatusBadge>
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
                          <p className="text-sm font-semibold text-black">
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

                          <p className="mt-1 text-xs text-neutral-500">
                            Follow-up: {formatDate(ticket.follow_up_date)}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <StatusBadge className={getStatusClass(ticket.status)}>
                            {formatStatus(ticket.status)}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <AdminButton
                              href={`/admin/cytnexus.com/tickets/${ticket.id}`}
                              variant="secondary"
                              size="sm"
                            >
                              View Ticket
                            </AdminButton>

                            <AdminButton
                              href={`/admin/cytnexus.com/onboarding?ticketId=${ticket.id}`}
                              size="sm"
                            >
                              Start Onboarding
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}