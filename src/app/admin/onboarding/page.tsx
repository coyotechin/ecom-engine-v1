import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminNavigation } from "@/config/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
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

type EngineType = "retail" | "learning" | "event";
type StoreStatus = "draft" | "review" | "live" | "paused" | "closed";

type TicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  business_name: string;
  business_category: string | null;
  selected_engine: EngineType;
  status: TicketStatus;
  revenue_share_percentage: number | null;
  expected_launch_date: string | null;
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

function formatStatus(status: TicketStatus | StoreStatus) {
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
  };

  return labels[status] || status;
}

function formatEngine(engine: EngineType) {
  const labels: Record<EngineType, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[engine];
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

function getStatusVariant(status: TicketStatus | StoreStatus) {
  if (status === "live" || status === "revenue_monitoring") {
    return "dark" as const;
  }

  if (
    status === "approved" ||
    status === "access_created" ||
    status === "setup_in_progress" ||
    status === "review"
  ) {
    return "outline" as const;
  }

  return "muted" as const;
}

export default async function AdminOnboardingPage() {
  const supabase = await createClient();

  const [{ data: ticketData, error: ticketError }, { data: businessData }, { data: storeData }] =
    await Promise.all([
      supabase
        .from("onboarding_tickets")
        .select(
          "id, ticket_code, customer_name, business_name, business_category, selected_engine, status, revenue_share_percentage, expected_launch_date, created_at",
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

  const tickets = (ticketData || []) as TicketRow[];
  const businesses = (businessData || []) as BusinessRow[];
  const stores = (storeData || []) as StoreRow[];

  const approvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "approved" ||
      ticket.status === "access_created" ||
      ticket.status === "setup_in_progress" ||
      ticket.status === "live" ||
      ticket.status === "revenue_monitoring",
  );

  const liveStores = stores.filter((store) => store.status === "live");

  const onboardingMetrics = [
    {
      label: "Total Tickets",
      value: String(tickets.length),
      helperText: "All onboarding enquiries available in Supabase.",
    },
    {
      label: "Approved / Setup Ready",
      value: String(approvedTickets.length),
      helperText: "Tickets ready for business profile and store setup.",
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
  ];

  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Customer Onboarding"
      description="Track the transition from onboarding ticket to client business profile, store setup, launch review, and live revenue-sharing customer."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Onboarding Workflow</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Customer Onboarding Pipeline
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This page helps CYT Nexus monitor customers from enquiry stage to
              business setup, store launch, and revenue-share monitoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/admin/tickets/create" variant="outline">
              Create Ticket
            </Button>

            <Button href="/admin/tickets" variant="primary">
              View Tickets
            </Button>
          </div>
        </section>

        {ticketError ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load onboarding data
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {ticketError.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {onboardingMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Approved / Setup-Ready Tickets</CardTitle>
              <CardDescription>
                These tickets are ready for client business profile creation,
                access setup, store setup, or launch review.
              </CardDescription>
            </CardHeader>

            {approvedTickets.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No setup-ready tickets yet
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Update a ticket status to Approved, Access Created, Setup in
                  Progress, Live, or Revenue Monitoring to show it here.
                </p>

                <div className="mt-6">
                  <Button href="/admin/tickets" variant="primary">
                    Manage Tickets
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="dark">{ticket.ticket_code}</Badge>
                          <Badge variant={getStatusVariant(ticket.status)}>
                            {formatStatus(ticket.status)}
                          </Badge>
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
                          Expected launch:{" "}
                          {formatDate(ticket.expected_launch_date)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
                        >
                          View Ticket
                        </Link>

                        <Button variant="primary">Create Business</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Client Businesses</CardTitle>
                <CardDescription>
                  Business profiles created from onboarding workflow.
                </CardDescription>
              </CardHeader>

              {businesses.length === 0 ? (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No businesses created yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Business creation will be added in the next micro step.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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

                        <Badge
                          variant={getStatusVariant(
                            business.onboarding_status,
                          )}
                        >
                          {formatStatus(business.onboarding_status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Store Setup Status</CardTitle>
                <CardDescription>
                  Storefront setup records connected to client businesses.
                </CardDescription>
              </CardHeader>

              {stores.length === 0 ? (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No stores created yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Store creation will be connected after business creation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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

                        <Badge variant={getStatusVariant(store.status)}>
                          {formatStatus(store.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}