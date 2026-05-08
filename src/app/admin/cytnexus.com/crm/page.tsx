import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin CRM | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus Admin CRM for Ecom Engine v.1 customers, businesses, onboarding tickets, client access accounts, stores, and engine status.",
};

type BusinessRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  business_category: string | null;
  business_location: string | null;
  engine_type: string | null;
  onboarding_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type TicketRow = {
  id: string;
  ticket_code: string;
  business_name: string;
  customer_name: string;
  mobile_number: string | null;
  email: string | null;
  selected_engine: string | null;
  status: string | null;
  client_access_status: string | null;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  created_at: string | null;
};

type AccessRow = {
  id: string;
  business_id: string | null;
  business_name: string;
  selected_engine: string;
  owner_admin_name: string;
  email: string;
  phone: string;
  user_id: string;
  staff_role: string;
  account_status: string;
  assigned_domain: string | null;
  assigned_subdomain: string | null;
  backend_access_url: string | null;
  created_at: string | null;
};

type StoreRow = {
  id: string;
  business_id: string;
  store_name: string;
  store_slug: string;
  status: string;
  is_active: boolean | null;
  created_at: string | null;
};

function formatEngine(engine: string | null | undefined) {
  const labels: Record<string, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return labels[String(engine || "")] || "Not set";
}

function formatStatus(status: string | null | undefined) {
  if (!status) {
    return "Not set";
  }

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
    created: "Created",
    not_created: "Not Created",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    draft: "Draft",
    review: "Review",
    paused: "Paused",
    closed: "Closed",
  };

  return (
    labels[status] ||
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
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
    value === "active" ||
    value === "access_created" ||
    value === "created" ||
    value === "live" ||
    value === "revenue_monitoring"
  ) {
    return "border-black bg-black text-white";
  }

  if (
    value === "approved" ||
    value === "setup_in_progress" ||
    value === "review" ||
    value === "draft"
  ) {
    return "border-neutral-400 bg-white text-black";
  }

  if (value === "inactive" || value === "suspended" || value === "rejected") {
    return "border-neutral-300 bg-neutral-100 text-neutral-600";
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

export default async function HiddenAdminCrmPage() {
  const supabase = await createClient();

  const [businessResult, ticketResult, accessResult, storeResult] =
    await Promise.all([
      supabase
        .from("businesses")
        .select(
          "id, business_name, owner_name, phone, email, business_category, business_location, engine_type, onboarding_status, is_active, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("onboarding_tickets")
        .select(
          "id, ticket_code, business_name, customer_name, mobile_number, email, selected_engine, status, client_access_status, setup_cost, revenue_share_percentage, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("client_access_accounts")
        .select(
          "id, business_id, business_name, selected_engine, owner_admin_name, email, phone, user_id, staff_role, account_status, assigned_domain, assigned_subdomain, backend_access_url, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("stores")
        .select(
          "id, business_id, store_name, store_slug, status, is_active, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);

  const businesses = (businessResult.data || []) as BusinessRow[];
  const tickets = (ticketResult.data || []) as TicketRow[];
  const accessAccounts = (accessResult.data || []) as AccessRow[];
  const stores = (storeResult.data || []) as StoreRow[];

  const activeBusinesses = businesses.filter(
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

  const accessCreated = accessAccounts.filter(
    (account) => account.account_status === "active",
  );

  const liveStores = stores.filter((store) => store.status === "live");

  const estimatedSetupValue = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.setup_cost || 0),
    0,
  );

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
              Hidden Admin CRM
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/dashboard" variant="secondary">
              Dashboard
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Tickets
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
              CYT Nexus Internal CRM
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Ecom Engine customer CRM
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Manage CYT Nexus Ecom Engine clients, onboarding leads, business
              profiles, backend access credentials, engine type, and storefront
              status from one hidden admin CRM view.
            </p>
          </div>

          <AdminButton href="/admin/cytnexus.com/tickets/create">
            Create New Ticket
          </AdminButton>
        </div>

        {businessResult.error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load business CRM records
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {businessResult.error.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active Customers"
            value={String(activeBusinesses.length)}
            helperText="Active Ecom Engine business profiles."
          />

          <MetricCard
            label="Retail Engine"
            value={String(retailCustomers.length)}
            helperText="Retail Commerce Engine clients."
          />

          <MetricCard
            label="Learning Engine"
            value={String(learningCustomers.length)}
            helperText="Learning Commerce Engine clients."
          />

          <MetricCard
            label="Event Engine"
            value={String(eventCustomers.length)}
            helperText="Event Commerce Engine clients."
          />

          <MetricCard
            label="Access Accounts"
            value={String(accessCreated.length)}
            helperText="Active backend/client portal access records."
          />

          <MetricCard
            label="Live Stores"
            value={String(liveStores.length)}
            helperText="Store records marked as live."
          />

          <MetricCard
            label="Lead Tickets"
            value={String(tickets.length)}
            helperText="Onboarding tickets collected by CYT Nexus."
          />

          <MetricCard
            label="Setup Value"
            value={formatCurrency(estimatedSetupValue)}
            helperText="Estimated setup value from onboarding ticket records."
          />
        </div>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Client Business Records
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Active and onboarded businesses
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                These are business profiles created from onboarding/client
                access workflows.
              </p>
            </div>

            <AdminButton href="/admin/cytnexus.com/client-access" variant="secondary">
              Create Access
            </AdminButton>
          </div>

          {businesses.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                No business records found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Business records will appear after client access is created from
                an approved onboarding ticket.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Business
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Owner
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Engine
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Store
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {businesses.map((business) => {
                      const store = stores.find(
                        (item) => item.business_id === business.id,
                      );

                      return (
                        <tr
                          key={business.id}
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {business.business_name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {business.business_category || "No category"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {business.business_location || "No location"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {business.owner_name || "No owner"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {business.phone || "No phone"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {business.email || "No email"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {formatEngine(business.engine_type)}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {store?.store_name || "No store"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {store?.store_slug
                                ? `/store/${store.store_slug}`
                                : "No storefront slug"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <StatusBadge
                              className={getStatusClass(
                                business.onboarding_status,
                              )}
                            >
                              {formatStatus(business.onboarding_status)}
                            </StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Backend Credential References
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Client portal access records
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              These records are generated from the hidden Client Access workflow.
            </p>
          </div>

          {accessAccounts.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                No access credentials found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create client access from an approved ticket to store credential
                references here.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {accessAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <StatusBadge className={getStatusClass(account.account_status)}>
                        {formatStatus(account.account_status)}
                      </StatusBadge>

                      <h3 className="mt-4 text-lg font-semibold tracking-tight text-black">
                        {account.business_name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        User ID: {account.user_id}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Role: {account.staff_role}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Engine: {formatEngine(account.selected_engine)}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Backend: {account.backend_access_url || "Not set"}
                      </p>
                    </div>

                    <AdminButton
                      href={account.backend_access_url || "/client/login"}
                      variant="secondary"
                      size="sm"
                    >
                      Open Backend
                    </AdminButton>
                  </div>

                  <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Domain
                    </p>

                    <p className="mt-2 text-sm font-medium text-black">
                      {account.assigned_subdomain || "No subdomain"}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {account.assigned_domain || "No custom domain"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}