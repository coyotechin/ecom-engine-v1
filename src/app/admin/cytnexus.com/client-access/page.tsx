import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClientAccessAction } from "@/app/admin/cytnexus.com/client-access/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Client Access | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus client access management page for Ecom Engine v.1 backend access, user ID creation, role management, permissions, and credential tracking.",
};

type ClientAccessPageProps = {
  searchParams: Promise<{
    ticketId?: string;
    success?: string;
    error?: string;
  }>;
};

type EngineType = "retail" | "learning" | "event";

type TicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  mobile_number: string | null;
  email: string | null;
  customer_address: string | null;
  business_name: string;
  business_category: string | null;
  business_location: string | null;
  selected_engine: EngineType;
  status: string;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  agreement_period: string | null;
  payment_status: string | null;
  settlement_cycle: string | null;
  client_access_status: string | null;
  converted_business_id: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  storefront_status: string | null;
  storefront_notes: string | null;
  created_at: string;
};

type ClientAccessRow = {
  id: string;
  onboarding_ticket_id: string | null;
  business_id: string | null;
  store_id: string | null;
  access_code: string;
  user_id: string;
  business_name: string;
  selected_engine: string;
  owner_admin_name: string;
  email: string;
  phone: string;
  employee_name: string | null;
  staff_role: string;
  assigned_domain: string | null;
  assigned_subdomain: string | null;
  account_status: string;
  temporary_password: string | null;
  password_status: string;
  backend_access_url: string | null;
  credential_notes: string | null;
  created_at: string;
};

const staffRoleOptions = [
  {
    label: "Owner",
    value: "Owner",
  },
  {
    label: "Manager",
    value: "Manager",
  },
  {
    label: "Staff",
    value: "Staff",
  },
  {
    label: "Accountant",
    value: "Accountant",
  },
];

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
    not_created: "Not Created",
    created: "Created",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    temporary_generated: "Temporary Generated",
    backend_prepared: "Backend Prepared",
    manual_not_started: "Manual Not Started",
    content_collection: "Content Collection",
    design_pending: "Design Pending",
    development_pending: "Development Pending",
    testing: "Testing",
    launched: "Launched",
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
    value === "access_created" ||
    value === "created" ||
    value === "active" ||
    value === "live" ||
    value === "revenue_monitoring"
  ) {
    return "border-black bg-black text-white";
  }

  if (
    value === "approved" ||
    value === "setup_in_progress" ||
    value === "backend_prepared" ||
    value === "testing"
  ) {
    return "border-neutral-400 bg-white text-black";
  }

  if (value === "rejected" || value === "on_hold" || value === "suspended") {
    return "border-neutral-300 bg-neutral-100 text-neutral-600";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function isTicketEligible(ticket: TicketRow) {
  return (
    ticket.status === "approved" ||
    ticket.status === "setup_in_progress" ||
    ticket.status === "access_created" ||
    ticket.status === "live" ||
    ticket.status === "revenue_monitoring"
  );
}

function getBackendAccessUrl(engine: EngineType) {
  if (engine === "retail") {
    return "/client/retail";
  }

  if (engine === "learning") {
    return "/client/learning";
  }

  return "/client/event";
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

function TextInput({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
      />
    </div>
  );
}

function SelectInput({
  id,
  name,
  label,
  options,
  defaultValue,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  options: {
    label: string;
    value: string;
  }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      <select
        id={id}
        name={name}
        defaultValue={defaultValue || ""}
        required={required}
        className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition focus:border-black"
      >
        <option value="" disabled>
          Choose option
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaInput({
  id,
  name,
  label,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        rows={4}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm leading-6 text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
      />
    </div>
  );
}

export default async function HiddenClientAccessPage({
  searchParams,
}: ClientAccessPageProps) {
  const { ticketId, success, error } = await searchParams;

  const supabase = await createClient();

  const [ticketResult, accessResult] = await Promise.all([
    supabase
      .from("onboarding_tickets")
      .select(
        "id, ticket_code, customer_name, mobile_number, email, customer_address, business_name, business_category, business_location, selected_engine, status, setup_cost, revenue_share_percentage, agreement_period, payment_status, settlement_cycle, client_access_status, converted_business_id, custom_domain, subdomain, storefront_status, storefront_notes, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("client_access_accounts")
      .select(
        "id, onboarding_ticket_id, business_id, store_id, access_code, user_id, business_name, selected_engine, owner_admin_name, email, phone, employee_name, staff_role, assigned_domain, assigned_subdomain, account_status, temporary_password, password_status, backend_access_url, credential_notes, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const tickets = (ticketResult.data || []) as TicketRow[];
  const accessAccounts = (accessResult.data || []) as ClientAccessRow[];

  const selectedTicket =
    tickets.find((ticket) => ticket.id === ticketId) || null;

  const eligibleTickets = tickets.filter((ticket) => isTicketEligible(ticket));
  const createdAccessCount = accessAccounts.length;
  const retailAccessCount = accessAccounts.filter(
    (account) => account.selected_engine === "retail",
  ).length;
  const learningAccessCount = accessAccounts.filter(
    (account) => account.selected_engine === "learning",
  ).length;
  const eventAccessCount = accessAccounts.filter(
    (account) => account.selected_engine === "event",
  ).length;

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
              Hidden Admin Client Access
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/onboarding" variant="secondary">
              Onboarding
            </AdminButton>

            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Tickets
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
              Backend Access Automation
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Client Access Management
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Create backend/client portal access after onboarding approval.
              This creates business profile, store reference, client credential
              record, engine permissions, and updates the ticket status to
              Access Created.
            </p>
          </div>

          <AdminButton href="/admin/cytnexus.com/tickets">
            Select Ticket
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
            <p className="text-sm font-semibold text-black">
              Client access action failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        {ticketResult.error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load tickets
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {ticketResult.error.message}
            </p>
          </div>
        ) : null}

        {accessResult.error ? (
          <div className="mt-8 rounded-3xl border border-neutral-300 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              Could not load client access accounts
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {accessResult.error.message}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailBox label="Eligible Tickets" value={eligibleTickets.length} />
          <DetailBox label="Access Created" value={createdAccessCount} />
          <DetailBox label="Retail Access" value={retailAccessCount} />
          <DetailBox
            label="Learning / Event"
            value={learningAccessCount + eventAccessCount}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="border-b border-neutral-200 pb-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Selected Ticket
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Ticket ready for backend access
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Select a ticket from the ticket detail or onboarding page to
                create backend/client portal access.
              </p>
            </div>

            {selectedTicket ? (
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge className="border-black bg-black text-white">
                    {selectedTicket.ticket_code}
                  </StatusBadge>

                  <StatusBadge className={getStatusClass(selectedTicket.status)}>
                    {formatStatus(selectedTicket.status)}
                  </StatusBadge>

                  <StatusBadge
                    className={getStatusClass(
                      selectedTicket.client_access_status,
                    )}
                  >
                    Access: {formatStatus(selectedTicket.client_access_status)}
                  </StatusBadge>
                </div>

                <h3 className="text-2xl font-semibold tracking-[-0.05em] text-black">
                  {selectedTicket.business_name}
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailBox
                    label="Customer"
                    value={selectedTicket.customer_name}
                  />
                  <DetailBox
                    label="Phone"
                    value={selectedTicket.mobile_number}
                  />
                  <DetailBox label="Email" value={selectedTicket.email} />
                  <DetailBox
                    label="Selected Engine"
                    value={formatEngine(selectedTicket.selected_engine)}
                  />
                  <DetailBox
                    label="Setup Cost"
                    value={formatCurrency(selectedTicket.setup_cost)}
                  />
                  <DetailBox
                    label="Revenue Share"
                    value={`${selectedTicket.revenue_share_percentage || 0}%`}
                  />
                  <DetailBox
                    label="Assigned Subdomain"
                    value={selectedTicket.subdomain}
                  />
                  <DetailBox
                    label="Custom Domain"
                    value={selectedTicket.custom_domain}
                  />
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    Access rule
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    The selected engine decides the client dashboard route and
                    access permissions. Retail clients go to Retail Engine,
                    Learning clients go to Learning Engine, and Event clients go
                    to Event Engine.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                  No ticket selected
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Go to Tickets or Onboarding and click Create Client Access
                  from an approved ticket.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <AdminButton href="/admin/cytnexus.com/tickets">
                    View Tickets
                  </AdminButton>

                  <AdminButton href="/admin/cytnexus.com/onboarding" variant="secondary">
                    View Onboarding
                  </AdminButton>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="border-b border-neutral-200 pb-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Create Access
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Generate client backend credentials
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                This creates backend access credentials in Admin Portal. The
                custom storefront remains a manual setup process.
              </p>
            </div>

            {selectedTicket ? (
              <form action={createClientAccessAction} className="mt-6 space-y-5">
                <input type="hidden" name="ticketId" value={selectedTicket.id} />

                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    id="ownerAdminName"
                    name="ownerAdminName"
                    label="Owner/Admin Name"
                    defaultValue={selectedTicket.customer_name}
                    required
                  />

                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    label="Client Email"
                    defaultValue={selectedTicket.email}
                    placeholder="client@example.com"
                    required
                  />

                  <TextInput
                    id="phone"
                    name="phone"
                    label="Client Phone"
                    defaultValue={selectedTicket.mobile_number}
                    required
                  />

                  <TextInput
                    id="employeeName"
                    name="employeeName"
                    label="Employee Name"
                    placeholder="Optional staff/employee name"
                  />

                  <SelectInput
                    id="staffRole"
                    name="staffRole"
                    label="Staff Role"
                    options={staffRoleOptions}
                    defaultValue="Owner"
                    required
                  />

                  <TextInput
                    id="assignedSubdomain"
                    name="assignedSubdomain"
                    label="Assigned Subdomain"
                    defaultValue={selectedTicket.subdomain}
                    placeholder="client.ecom-engine-v1.vercel.app"
                  />

                  <TextInput
                    id="assignedDomain"
                    name="assignedDomain"
                    label="Custom Domain"
                    defaultValue={selectedTicket.custom_domain}
                    placeholder="shop.clientdomain.com"
                  />

                  <TextInput
                    id="backendAccessUrl"
                    name="backendAccessUrl"
                    label="Backend Access URL"
                    defaultValue={getBackendAccessUrl(
                      selectedTicket.selected_engine,
                    )}
                    placeholder="/client/retail"
                  />

                  <TextAreaInput
                    id="credentialNotes"
                    name="credentialNotes"
                    label="Credential Notes"
                    placeholder="Example: Share credentials after agreement signing and advance payment confirmation."
                  />
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    What happens after saving?
                  </p>

                  <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                    <p>1. Business profile is created or updated.</p>
                    <p>2. Store/backend reference is created if missing.</p>
                    <p>3. User ID and temporary password are generated.</p>
                    <p>4. Engine permissions are stored.</p>
                    <p>5. Ticket status moves to Access Created.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black">
                      Create backend access
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Credentials will be shown after creation and stored in the
                      Admin Portal client access records.
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{ color: "#FFFFFF" }}
                    className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
                  >
                    Create Client Access
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                  Select a ticket first
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Client access can only be created from an onboarding ticket.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Created Credentials
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                Client access account records
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                These are backend credential references created by CYT Nexus.
                Temporary passwords are shown here for beta testing. In
                production, passwords should be rotated or sent securely.
              </p>
            </div>

            <AdminButton href="/admin/cytnexus.com/onboarding" variant="secondary">
              Onboarding
            </AdminButton>
          </div>

          {accessAccounts.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                No client access records found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create access from an approved onboarding ticket to show
                credentials here.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Access
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Client
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Engine
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Credentials
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Domain
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {accessAccounts.map((account) => (
                      <tr key={account.id} className="transition hover:bg-neutral-50">
                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {account.access_code}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Created: {formatDate(account.created_at)}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {account.business_name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Owner: {account.owner_admin_name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {account.email}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {account.phone}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {formatEngine(account.selected_engine)}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Role: {account.staff_role}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Backend: {account.backend_access_url || "Not set"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            User ID: {account.user_id}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Temp Password:{" "}
                            {account.temporary_password || "Not stored"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Password: {formatStatus(account.password_status)}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-medium text-black">
                            {account.assigned_subdomain || "No subdomain"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {account.assigned_domain || "No custom domain"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <StatusBadge
                            className={getStatusClass(account.account_status)}
                          >
                            {formatStatus(account.account_status)}
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