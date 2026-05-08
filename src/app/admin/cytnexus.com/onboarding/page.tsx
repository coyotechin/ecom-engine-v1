import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Onboarding Pipeline | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus onboarding pipeline for Ecom Engine v.1 ticket approval, engine setup, client access preparation, domain tracking, and manual storefront setup.",
};

type HiddenOnboardingPageProps = {
  searchParams: Promise<{
    ticketId?: string;
    success?: string;
    error?: string;
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

type EngineType = "retail" | "learning" | "event";
type StoreStatus = "draft" | "review" | "live" | "paused" | "closed";

type TicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  mobile_number: string | null;
  email: string | null;
  business_name: string;
  business_category: string | null;
  selected_engine: EngineType;
  status: TicketStatus;
  revenue_share_percentage: number | null;
  setup_cost: number | null;
  agreement_period: string | null;
  payment_status: string | null;
  settlement_cycle: string | null;
  follow_up_date: string | null;
  expected_launch_date: string | null;
  client_access_status: string | null;
  domain_status: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  storefront_status: string | null;
  storefront_notes: string | null;
  created_at: string;
};

type BusinessRow = {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  engine_type: EngineType;
  onboarding_status: TicketStatus;
  created_at: string;
};

type StoreRow = {
  id: string;
  business_id: string;
  store_name: string;
  store_slug: string;
  status: StoreStatus;
  created_at: string;
};

function formatStatus(status: TicketStatus | StoreStatus | string | null) {
  const value = String(status || "");

  const labels: Record<string, string> = {
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
    draft: "Draft",
    review: "Review",
    paused: "Paused",
    closed: "Closed",
    not_created: "Not Created",
    not_started: "Not Started",
    manual_not_started: "Manual Not Started",
    content_collection: "Content Collection",
    design_pending: "Design Pending",
    development_pending: "Development Pending",
    testing: "Testing",
    launched: "Launched",
    not_collected: "Not Collected",
    advance_pending: "Advance Pending",
    advance_collected: "Advance Collected",
    partially_paid: "Partially Paid",
    fully_paid: "Fully Paid",
    weekly: "Weekly",
    bi_weekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
  };

  return labels[value] || value || "Not set";
}

function formatEngine(engine: EngineType | string | null) {
  const value = String(engine || "");

  const labels: Record<string, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[value] || value || "Not set";
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

function getStatusClass(status: string | null | undefined) {
  const value = String(status || "");

  if (
    value === "live" ||
    value === "revenue_monitoring" ||
    value === "access_created" ||
    value === "launched"
  ) {
    return "border-black bg-black text-white";
  }

  if (
    value === "approved" ||
    value === "setup_in_progress" ||
    value === "review" ||
    value === "testing" ||
    value === "content_collection" ||
    value === "design_pending" ||
    value === "development_pending"
  ) {
    return "border-neutral-400 bg-white text-black";
  }

  if (value === "rejected" || value === "on_hold" || value === "closed") {
    return "border-neutral-300 bg-neutral-100 text-neutral-600";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function isSetupReady(ticket: TicketRow) {
  return (
    ticket.status === "approved" ||
    ticket.status === "access_created" ||
    ticket.status === "setup_in_progress" ||
    ticket.status === "live" ||
    ticket.status === "revenue_monitoring"
  );
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

function DetailBox({
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

export default async function HiddenAdminOnboardingPage({
  searchParams,
}: HiddenOnboardingPageProps) {
  const { ticketId, success, error } = await searchParams;

  const supabase = await createClient();

  const [
    ticketResult,
    businessResult,
    storeResult,
  ] = await Promise.all([
    supabase
      .from("onboarding_tickets")
      .select(
        "id, ticket_code, customer_name, mobile_number, email, business_name, business_category, selected_engine, status, revenue_share_percentage, setup_cost, agreement_period, payment_status, settlement_cycle, follow_up_date, expected_launch_date, client_access_status, domain_status, custom_domain, subdomain, storefront_status, storefront_notes, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("businesses")
      .select(
        "id, business_name, owner_name, phone, engine_type, onboarding_status, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("stores")
      .select("id, business_id, store_name, store_slug, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const tickets = (ticketResult.data || []) as TicketRow[];
  const businesses = (businessResult.data || []) as BusinessRow[];
  const stores = (storeResult.data || []) as StoreRow[];

  const selectedTicket =
    tickets.find((ticket) => ticket.id === ticketId) || null;

  const setupReadyTickets = tickets.filter((ticket) => isSetupReady(ticket));
  const accessCreatedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "access_created" ||
      ticket.client_access_status === "created",
  );
  const liveTickets = tickets.filter(
    (ticket) => ticket.status === "live" || ticket.status === "revenue_monitoring",
  );
  const liveStores = stores.filter((store) => store.status === "live");

  const onboardingMetrics = [
    {
      label: "Total Tickets",
      value: String(tickets.length),
      helperText: "All onboarding enquiries available in Supabase.",
    },
    {
      label: "Setup Ready",
      value: String(setupReadyTickets.length),
      helperText: "Approved tickets ready for business profile and access setup.",
    },
    {
      label: "Access Created",
      value: String(accessCreatedTickets.length),
      helperText: "Tickets that reached client access creation stage.",
    },
    {
      label: "Live / Monitoring",
      value: String(liveTickets.length),
      helperText: "Customers live or under revenue monitoring.",
    },
    {
      label: "Businesses Created",
      value: String(businesses.length),
      helperText: "Client business profiles created by CYT Nexus.",
    },
    {
      label: "Live Stores",
      value: String(liveStores.length),
      helperText: "Stores currently marked as live.",
    },
    {
      label: "Retail Pipeline",
      value: String(tickets.filter((ticket) => ticket.selected_engine === "retail").length),
      helperText: "Retail Commerce Engine onboarding tickets.",
    },
    {
      label: "Learning / Event",
      value: String(
        tickets.filter(
          (ticket) =>
            ticket.selected_engine === "learning" ||
            ticket.selected_engine === "event",
        ).length,
      ),
      helperText: "Learning and Event Commerce Engine onboarding tickets.",
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
              Hidden Admin Onboarding Pipeline
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Tickets
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/tickets/create">
              Create Ticket
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/dashboard" variant="secondary">
              Dashboard
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
              Customer Onboarding Pipeline
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Track the transition from onboarding ticket to engine setup,
              backend access preparation, domain/subdomain planning, manual
              storefront status, launch review, and revenue monitoring.
            </p>
          </div>

          <AdminButton href="/admin/cytnexus.com/client-access" variant="secondary">
            Client Access
          </AdminButton>
        </div>

        {success ? (
          <div className="mt-8 rounded-3xl border border-black bg-white p-5">
            <p className="text-sm font-semibold text-black">Success</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {success}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">Onboarding error</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        {ticketResult.error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load onboarding data
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {ticketResult.error.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {onboardingMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </div>

        {selectedTicket ? (
          <div className="mt-8 rounded-[2rem] border border-black bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge className="border-black bg-black text-white">
                    Selected Ticket
                  </StatusBadge>

                  <StatusBadge className={getStatusClass(selectedTicket.status)}>
                    {formatStatus(selectedTicket.status)}
                  </StatusBadge>
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-black">
                  {selectedTicket.business_name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {selectedTicket.ticket_code} ·{" "}
                  {formatEngine(selectedTicket.selected_engine)} · Customer:{" "}
                  {selectedTicket.customer_name}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <AdminButton
                  href={`/admin/cytnexus.com/tickets/${selectedTicket.id}`}
                  variant="secondary"
                >
                  View Ticket
                </AdminButton>

                <AdminButton
                  href={`/admin/cytnexus.com/client-access?ticketId=${selectedTicket.id}`}
                >
                  Create Client Access
                </AdminButton>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailBox
                label="Setup Cost"
                value={formatCurrency(selectedTicket.setup_cost)}
              />
              <DetailBox
                label="Revenue Share"
                value={`${selectedTicket.revenue_share_percentage || 0}%`}
              />
              <DetailBox
                label="Payment Status"
                value={formatStatus(selectedTicket.payment_status)}
              />
              <DetailBox
                label="Settlement Cycle"
                value={formatStatus(selectedTicket.settlement_cycle)}
              />
              <DetailBox
                label="Client Access"
                value={formatStatus(selectedTicket.client_access_status)}
              />
              <DetailBox
                label="Subdomain"
                value={selectedTicket.subdomain}
              />
              <DetailBox
                label="Custom Domain"
                value={selectedTicket.custom_domain}
              />
              <DetailBox
                label="Storefront Status"
                value={formatStatus(selectedTicket.storefront_status)}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Approved / Setup-Ready Tickets
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Tickets ready for onboarding action
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                  These tickets are ready for backend access planning, selected
                  engine setup, domain preparation, or manual storefront tracking.
                </p>
              </div>

              <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
                Manage Tickets
              </AdminButton>
            </div>

            {setupReadyTickets.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                  No setup-ready tickets yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Update a ticket status to Approved, Access Created, Setup in
                  Progress, Live, or Revenue Monitoring to show it here.
                </p>

                <div className="mt-6">
                  <AdminButton href="/admin/cytnexus.com/tickets">
                    Manage Tickets
                  </AdminButton>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {setupReadyTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`rounded-3xl border p-5 ${
                      ticket.id === ticketId
                        ? "border-black bg-white"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge className="border-black bg-black text-white">
                            {ticket.ticket_code}
                          </StatusBadge>

                          <StatusBadge className={getStatusClass(ticket.status)}>
                            {formatStatus(ticket.status)}
                          </StatusBadge>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold tracking-tight text-black">
                          {ticket.business_name}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          Customer: {ticket.customer_name}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Engine: {formatEngine(ticket.selected_engine)}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Expected launch: {formatDate(ticket.expected_launch_date)}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Client access: {formatStatus(ticket.client_access_status)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <AdminButton
                          href={`/admin/cytnexus.com/tickets/${ticket.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          View Ticket
                        </AdminButton>

                        <AdminButton
                          href={`/admin/cytnexus.com/client-access?ticketId=${ticket.id}`}
                          size="sm"
                        >
                          Create Access
                        </AdminButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Onboarding Flow
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Required process
              </h2>

              <div className="mt-6 space-y-3">
                {[
                  "Create Ticket",
                  "Collect Customer Details",
                  "Select Engine",
                  "Commercial Approval",
                  "Create Client Access",
                  "Setup Engine Dashboard",
                  "Prepare Domain/Subdomain",
                  "Manual Storefront Setup",
                  "Go Live",
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
            </section>

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Client Businesses
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Created business profiles
              </h2>

              {businesses.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No businesses created yet
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Business profiles will appear after client access and engine
                    setup flow is completed.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {businesses.slice(0, 5).map((business) => (
                    <div
                      key={business.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {business.business_name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Owner: {business.owner_name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {formatEngine(business.engine_type)}
                          </p>
                        </div>

                        <StatusBadge
                          className={getStatusClass(
                            business.onboarding_status,
                          )}
                        >
                          {formatStatus(business.onboarding_status)}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Storefront Status
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Manual storefront tracking
              </h2>

              {stores.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No stores created yet
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Store records will appear after backend/client portal setup.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {stores.slice(0, 5).map((store) => (
                    <div
                      key={store.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {store.store_name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            /store/{store.store_slug}
                          </p>
                        </div>

                        <StatusBadge className={getStatusClass(store.status)}>
                          {formatStatus(store.status)}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}