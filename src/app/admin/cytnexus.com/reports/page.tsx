import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Reports | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus Admin Reports for Ecom Engine v.1 revenue, settlements, customers, onboarding tickets, engine split, orders, and revenue-share performance.",
};

type OrderRow = {
  id: string;
  order_channel: string | null;
  order_status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string | null;
};

type RevenueShareRow = {
  id: string;
  gross_order_amount: number | null;
  net_revenue_amount: number | null;
  revenue_share_percentage: number | null;
  cyt_share_amount: number | null;
  client_share_amount: number | null;
  settlement_status: string | null;
  created_at: string | null;
};

type TicketRow = {
  id: string;
  selected_engine: string | null;
  status: string | null;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  created_at: string | null;
};

type BusinessRow = {
  id: string;
  business_name: string;
  engine_type: string | null;
  onboarding_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type AccessRow = {
  id: string;
  selected_engine: string | null;
  account_status: string | null;
  created_at: string | null;
};

type CheckoutRequestRow = {
  id: string;
  status: string | null;
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
    paid: "Paid",
    partial: "Partial",
    unpaid: "Unpaid",
    active: "Active",
    inactive: "Inactive",
  };

  return (
    labels[status] ||
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function formatEngine(engine: string | null | undefined) {
  const labels: Record<string, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[String(engine || "")] || "Not set";
}

function getStatusClass(status: string | null | undefined) {
  const value = String(status || "");

  if (
    value === "paid" ||
    value === "active" ||
    value === "live" ||
    value === "access_created" ||
    value === "converted_to_order" ||
    value === "revenue_monitoring"
  ) {
    return "border-black bg-black text-white";
  }

  if (
    value === "pending" ||
    value === "partial" ||
    value === "approved" ||
    value === "setup_in_progress"
  ) {
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

export default async function HiddenAdminReportsPage() {
  const supabase = await createClient();

  const [
    orderResult,
    revenueResult,
    ticketResult,
    businessResult,
    accessResult,
    checkoutResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_channel, order_status, payment_status, total_amount, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("revenue_share_entries")
      .select(
        "id, gross_order_amount, net_revenue_amount, revenue_share_percentage, cyt_share_amount, client_share_amount, settlement_status, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("onboarding_tickets")
      .select("id, selected_engine, status, setup_cost, revenue_share_percentage, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("businesses")
      .select("id, business_name, engine_type, onboarding_status, is_active, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("client_access_accounts")
      .select("id, selected_engine, account_status, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("checkout_requests")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const orders = (orderResult.data || []) as OrderRow[];
  const revenueEntries = (revenueResult.data || []) as RevenueShareRow[];
  const tickets = (ticketResult.data || []) as TicketRow[];
  const businesses = (businessResult.data || []) as BusinessRow[];
  const accessAccounts = (accessResult.data || []) as AccessRow[];
  const checkoutRequests = (checkoutResult.data || []) as CheckoutRequestRow[];

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const grossRevenueShareValue = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.gross_order_amount || 0),
    0,
  );

  const cytShare = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
    0,
  );

  const clientShare = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.client_share_amount || 0),
    0,
  );

  const pendingSettlements = revenueEntries.filter(
    (entry) => entry.settlement_status === "pending",
  );

  const pendingSettlementValue = pendingSettlements.reduce(
    (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
    0,
  );

  const estimatedSetupValue = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.setup_cost || 0),
    0,
  );

  const activeCustomers = businesses.filter(
    (business) => business.is_active !== false,
  );

  const retailCustomers = businesses.filter(
    (business) => business.engine_type === "retail",
  );

  const learningCustomers = businesses.filter(
    (business) => business.engine_type === "learning",
  );

  const eventCustomers = businesses.filter(
    (business) => business.engine_type === "event",
  );

  const pendingCheckoutRequests = checkoutRequests.filter(
    (request) => request.status === "pending",
  );

  const convertedCheckoutRequests = checkoutRequests.filter(
    (request) => request.status === "converted_to_order",
  );

  const revenueGraphMonths = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const month = date.toLocaleString("en-IN", {
      month: "short",
    });

    const revenue = orders
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
      revenue,
    };
  });

  const highestRevenue = Math.max(
    ...revenueGraphMonths.map((item) => item.revenue),
    1,
  );

  const engineRows = [
    {
      engine: "Retail Commerce Engine",
      customers: retailCustomers.length,
      tickets: tickets.filter((ticket) => ticket.selected_engine === "retail").length,
      access: accessAccounts.filter((account) => account.selected_engine === "retail").length,
    },
    {
      engine: "Learning Commerce Engine",
      customers: learningCustomers.length,
      tickets: tickets.filter((ticket) => ticket.selected_engine === "learning").length,
      access: accessAccounts.filter((account) => account.selected_engine === "learning").length,
    },
    {
      engine: "Event Commerce Engine",
      customers: eventCustomers.length,
      tickets: tickets.filter((ticket) => ticket.selected_engine === "event").length,
      access: accessAccounts.filter((account) => account.selected_engine === "event").length,
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
              Hidden Admin Reports
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/dashboard" variant="secondary">
              Dashboard
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/crm" variant="secondary">
              CRM
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/client-access">
              Client Access
            </AdminButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              CYT Nexus Internal Reports
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Ecom Engine performance reports
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Track revenue, CYT share, client share, settlements, tickets,
              active customers, engine distribution, checkout requests, and
              onboarding-to-access conversion.
            </p>
          </div>

          <AdminButton href="/admin/cytnexus.com/tickets/create">
            Create Ticket
          </AdminButton>
        </div>

        {(orderResult.error ||
          revenueResult.error ||
          ticketResult.error ||
          businessResult.error ||
          accessResult.error ||
          checkoutResult.error) ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load complete report data
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {orderResult.error?.message ||
                revenueResult.error?.message ||
                ticketResult.error?.message ||
                businessResult.error?.message ||
                accessResult.error?.message ||
                checkoutResult.error?.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            helperText="Total sales revenue from order records."
          />

          <MetricCard
            label="Revenue Share Base"
            value={formatCurrency(grossRevenueShareValue)}
            helperText="Gross value represented in revenue-share entries."
          />

          <MetricCard
            label="CYT Revenue Share"
            value={formatCurrency(cytShare)}
            helperText="CYT Nexus share from revenue-share entries."
          />

          <MetricCard
            label="Client Share"
            value={formatCurrency(clientShare)}
            helperText="Client-side revenue share after CYT share."
          />

          <MetricCard
            label="Pending Settlements"
            value={String(pendingSettlements.length)}
            helperText="Revenue-share entries awaiting settlement."
          />

          <MetricCard
            label="Pending Settlement Value"
            value={formatCurrency(pendingSettlementValue)}
            helperText="CYT share amount still pending settlement."
          />

          <MetricCard
            label="Active Customers"
            value={String(activeCustomers.length)}
            helperText="Active Ecom Engine customer businesses."
          />

          <MetricCard
            label="Setup Pipeline Value"
            value={formatCurrency(estimatedSetupValue)}
            helperText="Estimated setup value from onboarding tickets."
          />

          <MetricCard
            label="Total Orders"
            value={String(orders.length)}
            helperText="Orders created from POS and online conversion."
          />

          <MetricCard
            label="Checkout Requests"
            value={String(checkoutRequests.length)}
            helperText="Public checkout requests submitted by customers."
          />

          <MetricCard
            label="Pending Requests"
            value={String(pendingCheckoutRequests.length)}
            helperText="Checkout requests waiting for client/admin review."
          />

          <MetricCard
            label="Converted Requests"
            value={String(convertedCheckoutRequests.length)}
            helperText="Checkout requests converted into confirmed orders."
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.78fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Revenue Graph
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Last 6 months revenue trend
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Revenue is calculated from order totals grouped by month.
                </p>
              </div>

              <AdminButton href="/admin/cytnexus.com/dashboard" variant="secondary">
                Dashboard
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
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Settlement Summary
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Revenue-share settlement status
            </h2>

            <div className="mt-6 space-y-3">
              {["pending", "settled", "hold", "disputed"].map((status) => {
                const entries = revenueEntries.filter(
                  (entry) => entry.settlement_status === status,
                );

                const value = entries.reduce(
                  (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
                  0,
                );

                return (
                  <div
                    key={status}
                    className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <StatusBadge className={getStatusClass(status)}>
                          {formatStatus(status)}
                        </StatusBadge>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                          {entries.length} settlement entr
                          {entries.length === 1 ? "y" : "ies"}
                        </p>
                      </div>

                      <p className="text-lg font-semibold tracking-[-0.04em] text-black">
                        {formatCurrency(value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Engine-wise Report
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Customer and access split by engine
            </h2>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Engine
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Customers
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Tickets
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Access Accounts
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200 bg-white">
                  {engineRows.map((row) => (
                    <tr key={row.engine} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-black">
                          {row.engine}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-black">
                        {row.customers}
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-black">
                        {row.tickets}
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-black">
                        {row.access}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Recent Revenue Share Entries
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Settlement tracking records
            </h2>
          </div>

          {revenueEntries.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                No revenue-share entries found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Revenue-share entries will appear after POS billing or checkout
                request conversion creates revenue records.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Gross
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        CYT Share
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Client Share
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Percentage
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {revenueEntries.slice(0, 10).map((entry) => (
                      <tr key={entry.id} className="transition hover:bg-neutral-50">
                        <td className="px-5 py-5 text-sm font-semibold text-black">
                          {formatCurrency(entry.gross_order_amount)}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-black">
                          {formatCurrency(entry.cyt_share_amount)}
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-700">
                          {formatCurrency(entry.client_share_amount)}
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-700">
                          {entry.revenue_share_percentage || 0}%
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            className={getStatusClass(entry.settlement_status)}
                          >
                            {formatStatus(entry.settlement_status)}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}