import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard | Ecom Engine v.1 | CYT Nexus",
  description:
    "Hidden CYT Nexus admin dashboard for Ecom Engine v.1 onboarding, tickets, revenue, clients, reports, and notifications.",
};

type TicketRow = {
  id: string;
  status: string | null;
  selected_engine: string | null;
  created_at: string | null;
  follow_up_date: string | null;
};

type BusinessRow = {
  id: string;
  engine_type: string | null;
  onboarding_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type OrderRow = {
  id: string;
  total_amount: number | null;
  created_at: string | null;
};

type RevenueShareRow = {
  id: string;
  cyt_share_amount: number | null;
  client_share_amount: number | null;
  settlement_status: string | null;
  created_at: string | null;
};

type CheckoutRequestRow = {
  id: string;
  status: string | null;
  request_number: string | null;
  customer_name: string | null;
  total_amount: number | null;
  created_at: string | null;
};

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeEngine(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function isRetailEngine(value: string | null | undefined) {
  const engine = normalizeEngine(value);
  return engine.includes("retail");
}

function isLearningEngine(value: string | null | undefined) {
  const engine = normalizeEngine(value);
  return engine.includes("learning");
}

function isEventEngine(value: string | null | undefined) {
  const engine = normalizeEngine(value);
  return engine.includes("event");
}

function isNewTicketStatus(value: string | null | undefined) {
  const status = String(value || "").toLowerCase();
  return status.includes("new") || status.includes("enquiry");
}

function isConvertedStatus(value: string | null | undefined) {
  const status = String(value || "").toLowerCase();

  return (
    status.includes("approved") ||
    status.includes("access") ||
    status.includes("live") ||
    status.includes("converted") ||
    status.includes("monitoring")
  );
}

function isPendingFollowUp(ticket: TicketRow) {
  const status = String(ticket.status || "").toLowerCase();

  if (
    status.includes("live") ||
    status.includes("rejected") ||
    status.includes("converted") ||
    status.includes("monitoring")
  ) {
    return false;
  }

  return true;
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

function StatCard({
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

function getStatusClass(status: string | null | undefined) {
  const value = String(status || "");

  if (
    value === "live" ||
    value === "revenue_monitoring" ||
    value === "access_created" ||
    value === "converted_to_order" ||
    value === "active"
  ) {
    return "border-black bg-black text-white";
  }

  if (
    value === "pending" ||
    value === "approved" ||
    value === "setup_in_progress" ||
    value === "commercial_discussion"
  ) {
    return "border-neutral-400 bg-white text-black";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function formatStatus(status: string | null | undefined) {
  if (!status) {
    return "Not set";
  }

  const labels: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    converted_to_order: "Converted to Order",
    rejected: "Rejected",
    cancelled: "Cancelled",
    new_enquiry: "New Enquiry",
    requirement_collected: "Requirement Collected",
    engine_suggested: "Engine Suggested",
    commercial_discussion: "Commercial Discussion",
    approved: "Approved",
    access_created: "Access Created",
    setup_in_progress: "Setup in Progress",
    live: "Live",
    revenue_monitoring: "Revenue Monitoring",
  };

  return (
    labels[status] ||
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export default async function HiddenAdminDashboardPage() {
  const supabase = await createClient();

  const [
    ticketResult,
    businessResult,
    orderResult,
    revenueResult,
    checkoutRequestResult,
  ] = await Promise.all([
    supabase
      .from("onboarding_tickets")
      .select("id, status, selected_engine, created_at, follow_up_date")
      .order("created_at", { ascending: false }),

    supabase
      .from("businesses")
      .select("id, engine_type, onboarding_status, is_active, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("orders")
      .select("id, total_amount, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("revenue_share_entries")
      .select(
        "id, cyt_share_amount, client_share_amount, settlement_status, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("checkout_requests")
      .select("id, status, request_number, customer_name, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const tickets = (ticketResult.data || []) as TicketRow[];
  const businesses = (businessResult.data || []) as BusinessRow[];
  const orders = (orderResult.data || []) as OrderRow[];
  const revenueShares = (revenueResult.data || []) as RevenueShareRow[];
  const checkoutRequests = (checkoutRequestResult.data ||
    []) as CheckoutRequestRow[];

  const totalTickets = tickets.length;

  const newTickets = tickets.filter((ticket) =>
    isNewTicketStatus(ticket.status),
  ).length;

  const pendingFollowUps = tickets.filter((ticket) =>
    isPendingFollowUp(ticket),
  ).length;

  const convertedCustomers = tickets.filter((ticket) =>
    isConvertedStatus(ticket.status),
  ).length;

  const activeCustomers = businesses.filter(
    (business) => business.is_active !== false,
  ).length;

  const retailCustomers = businesses.filter((business) =>
    isRetailEngine(business.engine_type),
  ).length;

  const learningCustomers = businesses.filter((business) =>
    isLearningEngine(business.engine_type),
  ).length;

  const eventCustomers = businesses.filter((business) =>
    isEventEngine(business.engine_type),
  ).length;

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const cytRevenueShare = revenueShares.reduce(
    (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
    0,
  );

  const pendingSettlements = revenueShares.filter(
    (entry) => String(entry.settlement_status || "").toLowerCase() === "pending",
  );

  const pendingSettlementValue = pendingSettlements.reduce(
    (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
    0,
  );

  const openSupportIssues = checkoutRequests.filter(
    (request) => String(request.status || "").toLowerCase() === "pending",
  ).length;

  const revenueGraphMonths = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const month = date.toLocaleString("en-IN", {
      month: "short",
    });

    const monthRevenue = orders
      .filter((order) => {
        if (!order.created_at) {
          return false;
        }

        const orderDate = new Date(order.created_at);

        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return {
      month,
      revenue: monthRevenue,
    };
  });

  const highestRevenue = Math.max(
    ...revenueGraphMonths.map((item) => item.revenue),
    1,
  );

  const notifications = [
    {
      title: "New tickets awaiting review",
      value: `${newTickets} new`,
      helper:
        "Review new enquiries and move qualified leads to requirement collection.",
      href: "/admin/cytnexus.com/tickets",
    },
    {
      title: "Pending follow-ups",
      value: `${pendingFollowUps} pending`,
      helper:
        "Follow up with customers before commercial discussion becomes cold.",
      href: "/admin/cytnexus.com/onboarding",
    },
    {
      title: "Checkout requests pending",
      value: `${openSupportIssues} open`,
      helper:
        "Customer checkout requests need review before conversion into orders.",
      href: "/admin/cytnexus.com/reports",
    },
    {
      title: "Pending settlements",
      value: `${pendingSettlements.length} pending`,
      helper: "Revenue-share settlement entries need finance review.",
      href: "/admin/cytnexus.com/reports",
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
              Ecom Engine v.1 Admin Dashboard
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Tickets
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/onboarding" variant="secondary">
              Onboarding
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/client-access">
              Client Access
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/crm" variant="secondary">
              CRM
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/reports" variant="secondary">
              Reports
            </AdminButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Hidden CYT Executive Portal
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Admin operations dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Manage onboarding tickets, engine customers, revenue-share entries,
              pending settlements, checkout requests, CRM, reports, and
              operational notifications from one CYT Nexus control view.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Total Revenue Generated
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-black">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {(ticketResult.error ||
          businessResult.error ||
          orderResult.error ||
          revenueResult.error ||
          checkoutRequestResult.error) ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load complete dashboard data
            </p>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {ticketResult.error?.message ||
                businessResult.error?.message ||
                orderResult.error?.message ||
                revenueResult.error?.message ||
                checkoutRequestResult.error?.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tickets"
            value={String(totalTickets)}
            helperText="All onboarding tickets created by CYT executives."
          />

          <StatCard
            label="New Tickets"
            value={String(newTickets)}
            helperText="Fresh enquiries waiting for requirement collection."
          />

          <StatCard
            label="Pending Follow-ups"
            value={String(pendingFollowUps)}
            helperText="Tickets not yet closed, live, or converted."
          />

          <StatCard
            label="Converted Customers"
            value={String(convertedCustomers)}
            helperText="Tickets moved into approval, access, or live stage."
          />

          <StatCard
            label="Active Customers"
            value={String(activeCustomers)}
            helperText="Active Ecom Engine customer business records."
          />

          <StatCard
            label="Retail Engine"
            value={String(retailCustomers)}
            helperText="Customers onboarded for Retail Commerce Engine."
          />

          <StatCard
            label="Learning Engine"
            value={String(learningCustomers)}
            helperText="Customers onboarded for Learning Commerce Engine."
          />

          <StatCard
            label="Event Engine"
            value={String(eventCustomers)}
            helperText="Customers onboarded for Event Commerce Engine."
          />

          <StatCard
            label="CYT Revenue Share"
            value={formatCurrency(cytRevenueShare)}
            helperText="CYT Nexus share calculated from revenue entries."
          />

          <StatCard
            label="Pending Settlements"
            value={String(pendingSettlements.length)}
            helperText="Revenue-share entries waiting for settlement."
          />

          <StatCard
            label="Pending Settlement Value"
            value={formatCurrency(pendingSettlementValue)}
            helperText="CYT revenue-share amount awaiting settlement."
          />

          <StatCard
            label="Open Support / Issues"
            value={String(openSupportIssues)}
            helperText="Pending customer requests requiring action."
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Revenue Graph
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Last 6 months revenue trend
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Simple beta graph based on live order totals from Supabase.
                </p>
              </div>

              <AdminButton href="/admin/cytnexus.com/reports" variant="secondary">
                View Reports
              </AdminButton>
            </div>

            <div className="mt-8 flex h-72 items-end gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              {revenueGraphMonths.map((item) => {
                const height = Math.max((item.revenue / highestRevenue) * 100, 6);

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col justify-end gap-3"
                  >
                    <div className="flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-2xl bg-black"
                        style={{ height: `${height}%` }}
                        title={`${item.month}: ${formatCurrency(item.revenue)}`}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-black">
                        {item.month}
                      </p>

                      <p className="mt-1 text-[11px] text-neutral-500">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Notifications
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Admin attention panel
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Priority items from tickets, checkout requests, and settlements.
            </p>

            <div className="mt-6 space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-black">
                        {item.title}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        {item.helper}
                      </p>

                      <div className="mt-4">
                        <AdminButton href={item.href} variant="secondary" size="sm">
                          Review
                        </AdminButton>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-black">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Recent Checkout Requests
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Customer request activity
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                This is an admin overview. Detailed client-side processing stays
                in the client portal.
              </p>
            </div>

            <AdminButton href="/admin/cytnexus.com/reports" variant="secondary">
              View Reports
            </AdminButton>
          </div>

          {checkoutRequests.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-sm font-semibold text-black">
                No checkout requests found
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Customer checkout requests from public storefronts will appear
                here after submission.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Request
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Customer
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {checkoutRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-5 text-sm font-semibold text-black">
                          {request.request_number || "Request"}
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-700">
                          {request.customer_name || "Customer not available"}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-black">
                          {formatCurrency(request.total_amount)}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge className={getStatusClass(request.status)}>
                            {formatStatus(request.status)}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-600">
                          {formatDate(request.created_at)}
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