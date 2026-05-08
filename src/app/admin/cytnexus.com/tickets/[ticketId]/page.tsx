import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ticket Detail | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus ticket detail page for Ecom Engine v.1 onboarding, engine selection, commercial terms, client access preparation, and storefront tracking.",
};

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
  payment_status?: string | null;
  settlement_cycle?: string | null;

  follow_up_date: string | null;
  expected_launch_date: string | null;
  assigned_executive_name?: string | null;

  requirement_details: string | null;
  internal_notes: string | null;

  client_access_status?: string | null;
  domain_status?: string | null;
  custom_domain?: string | null;
  subdomain?: string | null;
  storefront_status?: string | null;
  storefront_notes?: string | null;

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

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
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

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-50"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{ color: "#FFFFFF" }}
      className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-3 text-sm font-semibold transition hover:bg-neutral-800"
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
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

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function LongTextBox({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 md:col-span-2">
      <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
        {title}
      </p>

      <p className="mt-3 text-sm leading-7 text-neutral-700">
        {value || "No details added."}
      </p>
    </div>
  );
}

export default async function HiddenTicketDetailPage({
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
              Hidden Admin Ticket Detail
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Back to Tickets
            </AdminButton>

            <AdminButton
              href={`/admin/cytnexus.com/onboarding?ticketId=${ticket.id}`}
            >
              Start Onboarding
            </AdminButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge className="border-black bg-black text-white">
                {ticket.ticket_code}
              </StatusBadge>

              <StatusBadge className={getStatusClass(ticket.status)}>
                {formatStatus(ticket.status)}
              </StatusBadge>

              <StatusBadge className={getPriorityClass(ticket.priority)}>
                {formatPriority(ticket.priority)} Priority
              </StatusBadge>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              {ticket.business_name}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Complete onboarding ticket view for customer requirement,
              selected engine, commercial discussion, client access preparation,
              domain tracking, and manual storefront setup.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AdminButton
              href={`/admin/cytnexus.com/client-access?ticketId=${ticket.id}`}
              variant="secondary"
            >
              Create Client Access
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/tickets/create">
              Create New Ticket
            </AdminButton>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.78fr]">
          <div className="space-y-6">
            <DetailSection
              title="Customer Details"
              description="Contact information collected by the CYT Nexus executive."
            >
              <DetailItem label="Customer Name" value={ticket.customer_name} />
              <DetailItem label="Mobile Number" value={ticket.mobile_number} />
              <DetailItem label="Email" value={ticket.email} />
              <DetailItem
                label="Customer Address"
                value={ticket.customer_address}
              />
            </DetailSection>

            <DetailSection
              title="Business Details"
              description="Business profile and current sales method."
            >
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
            </DetailSection>

            <DetailSection
              title="Engine Requirement"
              description="Selected commerce engine and requirement notes."
            >
              <DetailItem
                label="Selected Engine"
                value={formatEngine(ticket.selected_engine)}
              />
              <DetailItem label="Ticket Source" value={ticket.ticket_source} />
              <LongTextBox
                title="Requirement Details"
                value={ticket.requirement_details}
              />
              <LongTextBox
                title="Internal Notes"
                value={ticket.internal_notes}
              />
            </DetailSection>

            <DetailSection
              title="Domain and Manual Storefront"
              description="Backend access will be automated later. Custom storefront remains manual in this beta flow."
            >
              <DetailItem
                label="Client Access Status"
                value={formatLabel(ticket.client_access_status)}
              />
              <DetailItem
                label="Domain Status"
                value={formatLabel(ticket.domain_status)}
              />
              <DetailItem label="Assigned Subdomain" value={ticket.subdomain} />
              <DetailItem label="Custom Domain" value={ticket.custom_domain} />
              <DetailItem
                label="Storefront Status"
                value={formatLabel(ticket.storefront_status)}
              />
              <LongTextBox
                title="Storefront Setup Notes"
                value={ticket.storefront_notes}
              />
            </DetailSection>
          </div>

          <div className="space-y-6">
            <DetailSection
              title="Commercial Terms"
              description="Setup cost, revenue share, agreement, payment, and settlement details."
            >
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
              <DetailItem
                label="Payment Status"
                value={formatLabel(ticket.payment_status)}
              />
              <DetailItem
                label="Settlement Cycle"
                value={formatLabel(ticket.settlement_cycle)}
              />
            </DetailSection>

            <DetailSection
              title="Workflow Details"
              description="Status, follow-up, launch expectation, and assigned executive."
            >
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
              <DetailItem
                label="Assigned Executive"
                value={ticket.assigned_executive_name}
              />
            </DetailSection>

            <DetailSection
              title="Ticket Status Flow"
              description="Required onboarding flow for Ecom Engine v.1 beta."
            >
              <div className="space-y-3 md:col-span-2">
                {[
                  "New Enquiry",
                  "Requirement Collected",
                  "Engine Suggested",
                  "Commercial Discussion",
                  "Approved",
                  "Access Created",
                  "Setup in Progress",
                  "Live",
                  "Revenue Monitoring",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold text-black">
                      {index + 1}
                    </span>

                    <span className="text-sm font-medium text-neutral-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection
              title="System Record"
              description="Supabase record information."
            >
              <DetailItem label="Record ID" value={ticket.id} />
              <DetailItem
                label="Created At"
                value={formatDateTime(ticket.created_at)}
              />
              <DetailItem
                label="Updated At"
                value={formatDateTime(ticket.updated_at)}
              />
            </DetailSection>
          </div>
        </div>
      </section>
    </main>
  );
}