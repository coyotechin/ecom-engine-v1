import Link from "next/link";
import type { Metadata } from "next";
import { createHiddenAdminTicketAction } from "@/app/admin/cytnexus.com/tickets/create/actions";

export const metadata: Metadata = {
  title: "Create Ticket | CYT Executive Portal | Ecom Engine v.1",
  description:
    "Create hidden CYT Nexus onboarding tickets for Ecom Engine v.1 customer onboarding, engine selection, commercial terms, domain preparation, and client access setup.",
};

type CreateHiddenTicketPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

const engineOptions = [
  {
    label: "Retail Commerce Engine",
    value: "retail",
  },
  {
    label: "Learning Commerce Engine",
    value: "learning",
  },
  {
    label: "Event Commerce Engine",
    value: "event",
  },
];

const ticketSourceOptions = [
  {
    label: "Walk-in",
    value: "Walk-in",
  },
  {
    label: "WhatsApp",
    value: "WhatsApp",
  },
  {
    label: "Phone Call",
    value: "Phone Call",
  },
  {
    label: "Website",
    value: "Website",
  },
  {
    label: "Referral",
    value: "Referral",
  },
  {
    label: "Social Media",
    value: "Social Media",
  },
];

const priorityOptions = [
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "High",
    value: "high",
  },
];

const statusOptions = [
  {
    label: "New Enquiry",
    value: "new_enquiry",
  },
  {
    label: "Requirement Collected",
    value: "requirement_collected",
  },
  {
    label: "Engine Suggested",
    value: "engine_suggested",
  },
  {
    label: "Commercial Discussion",
    value: "commercial_discussion",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Access Created",
    value: "access_created",
  },
  {
    label: "Setup in Progress",
    value: "setup_in_progress",
  },
  {
    label: "Live",
    value: "live",
  },
  {
    label: "Revenue Monitoring",
    value: "revenue_monitoring",
  },
  {
    label: "On Hold",
    value: "on_hold",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

const paymentStatusOptions = [
  {
    label: "Not Collected",
    value: "not_collected",
  },
  {
    label: "Advance Pending",
    value: "advance_pending",
  },
  {
    label: "Advance Collected",
    value: "advance_collected",
  },
  {
    label: "Partially Paid",
    value: "partially_paid",
  },
  {
    label: "Fully Paid",
    value: "fully_paid",
  },
];

const settlementCycleOptions = [
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Bi-weekly",
    value: "bi_weekly",
  },
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Quarterly",
    value: "quarterly",
  },
];

const storefrontStatusOptions = [
  {
    label: "Manual Not Started",
    value: "manual_not_started",
  },
  {
    label: "Content Collection",
    value: "content_collection",
  },
  {
    label: "Design Pending",
    value: "design_pending",
  },
  {
    label: "Development Pending",
    value: "development_pending",
  },
  {
    label: "Testing",
    value: "testing",
  },
  {
    label: "Launched",
    value: "launched",
  },
];

function AdminButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
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

      <div className="mt-6 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextInput({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  inputMode,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
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
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
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
  required = false,
  defaultValue = "",
}: {
  id: string;
  name: string;
  label: string;
  options: {
    label: string;
    value: string;
  }[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
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
  helperText,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        rows={5}
        className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm leading-6 text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
      />

      {helperText ? (
        <p className="mt-2 text-xs leading-5 text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default async function HiddenCreateTicketPage({
  searchParams,
}: CreateHiddenTicketPageProps) {
  const { success, error } = await searchParams;

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
              Hidden Admin Create Ticket
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
              Back to Tickets
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
              Create Onboarding Ticket
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Collect customer details, engine selection, commercial terms,
              onboarding notes, and domain/storefront preparation details. Client
              access will be created later after approval and engine setup.
            </p>
          </div>

          <AdminButton href="/admin/cytnexus.com/tickets">
            View Tickets
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
              Ticket creation failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <form action={createHiddenAdminTicketAction} className="mt-8 space-y-6">
          <FormSection
            title="Customer Details"
            description="Capture the customer or decision-maker details."
          >
            <TextInput
              id="customerName"
              name="customerName"
              label="Customer Name"
              placeholder="Example: Mr. Customer"
              required
            />

            <TextInput
              id="mobileNumber"
              name="mobileNumber"
              label="Mobile Number"
              placeholder="+91 XXXXX XXXXX"
              inputMode="tel"
              required
            />

            <TextInput
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="customer@example.com"
              inputMode="email"
            />

            <TextInput
              id="customerAddress"
              name="customerAddress"
              label="Address"
              placeholder="Full customer/business address"
            />
          </FormSection>

          <FormSection
            title="Business Details"
            description="Capture the business name, category, location, and current sales method."
          >
            <TextInput
              id="businessName"
              name="businessName"
              label="Business Name"
              placeholder="Example: ABC Boutique"
              required
            />

            <TextInput
              id="businessCategory"
              name="businessCategory"
              label="Business Category"
              placeholder="Example: Fashion Retail / Academy / Events"
            />

            <TextInput
              id="businessLocation"
              name="businessLocation"
              label="Business Location"
              placeholder="Example: Chennai"
            />

            <TextInput
              id="currentSalesMethod"
              name="currentSalesMethod"
              label="Current Sales Method"
              placeholder="Offline store / WhatsApp / Instagram / Website"
            />
          </FormSection>

          <FormSection
            title="Engine Selection"
            description="Select the commerce engine and current ticket stage."
          >
            <SelectInput
              id="selectedEngine"
              name="selectedEngine"
              label="Selected Engine"
              options={engineOptions}
              required
            />

            <SelectInput
              id="ticketSource"
              name="ticketSource"
              label="Ticket Source"
              options={ticketSourceOptions}
            />

            <SelectInput
              id="priority"
              name="priority"
              label="Priority"
              options={priorityOptions}
              defaultValue="medium"
              required
            />

            <SelectInput
              id="status"
              name="status"
              label="Ticket Status"
              options={statusOptions}
              defaultValue="new_enquiry"
              required
            />

            <TextAreaInput
              id="requirementDetails"
              name="requirementDetails"
              label="Requirement Details"
              placeholder="Example: Client needs online store, POS billing, inventory, CRM, delivery management, campaigns, and reports."
              helperText="Mention the modules required for the selected engine."
            />
          </FormSection>

          <FormSection
            title="Commercial Details"
            description="Capture setup cost, revenue share percentage, agreement period, payment status, and settlement cycle."
          >
            <TextInput
              id="setupCost"
              name="setupCost"
              label="Setup Cost"
              placeholder="Example: 9999"
              inputMode="decimal"
            />

            <TextInput
              id="revenueSharePercentage"
              name="revenueSharePercentage"
              label="Revenue Share Percentage"
              placeholder="Example: 15"
              inputMode="decimal"
            />

            <TextInput
              id="agreementPeriod"
              name="agreementPeriod"
              label="Agreement Period"
              placeholder="Example: 12 months"
            />

            <SelectInput
              id="paymentStatus"
              name="paymentStatus"
              label="Payment Status"
              options={paymentStatusOptions}
              defaultValue="not_collected"
            />

            <SelectInput
              id="settlementCycle"
              name="settlementCycle"
              label="Settlement Cycle"
              options={settlementCycleOptions}
              defaultValue="monthly"
            />

            <TextInput
              id="followUpDate"
              name="followUpDate"
              type="date"
              label="Follow-up Date"
            />
          </FormSection>

          <FormSection
            title="Onboarding Details"
            description="Assign executive, launch expectation, internal notes, and next actions."
          >
            <TextInput
              id="assignedExecutiveName"
              name="assignedExecutiveName"
              label="Assigned Executive"
              placeholder="Example: Mir / Priya / Sales Executive"
            />

            <TextInput
              id="expectedLaunchDate"
              name="expectedLaunchDate"
              type="date"
              label="Expected Launch Date"
            />

            <TextAreaInput
              id="internalNotes"
              name="internalNotes"
              label="Internal Notes"
              placeholder="Example: Client wants demo before commercial approval. Follow up after product catalogue collection."
              helperText="Add discussion notes, client expectations, risks, and next action."
            />
          </FormSection>

          <FormSection
            title="Domain and Storefront Preparation"
            description="Backend/client portal access will be automated later. Custom storefront setup remains manual in this beta flow."
          >
            <TextInput
              id="subdomain"
              name="subdomain"
              label="Assigned Subdomain"
              placeholder="Example: clientname.ecom-engine-v1.vercel.app"
            />

            <TextInput
              id="customDomain"
              name="customDomain"
              label="Custom Domain"
              placeholder="Example: shop.clientdomain.com"
            />

            <SelectInput
              id="storefrontStatus"
              name="storefrontStatus"
              label="Manual Storefront Status"
              options={storefrontStatusOptions}
              defaultValue="manual_not_started"
            />

            <TextAreaInput
              id="storefrontNotes"
              name="storefrontNotes"
              label="Manual Storefront Setup Notes"
              placeholder="Example: Storefront will be built manually after content, images, product catalogue, and branding are collected."
              helperText="Use this to track manual frontend/storefront work separately from automated backend access."
            />
          </FormSection>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.04em] text-black">
                Save onboarding ticket
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                This creates the ticket only. Client access creation and custom
                engine setup will happen in the next onboarding/client-access
                workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AdminButton href="/admin/cytnexus.com/tickets" variant="secondary">
                Cancel
              </AdminButton>

              <button
                type="submit"
                style={{ color: "#FFFFFF" }}
                className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
              >
                Save Ticket
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}