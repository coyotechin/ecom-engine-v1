import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Client Dashboard | Ecom Engine v.1 | CYT Nexus",
  description:
    "Client Dashboard for Ecom Engine v.1 by CYT Nexus. Access Retail, Learning, and Event Commerce Engine dashboards based on assigned client access.",
};

function ClientButton({
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

function EngineCard({
  title,
  description,
  href,
  modules,
}: {
  title: string;
  description: string;
  href: string;
  modules: string[];
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {description}
          </p>
        </div>

        <ClientButton href={href}>Open Engine</ClientButton>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
          >
            <span className="h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-medium text-neutral-700">
              {module}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  const dashboardMetrics = [
    {
      label: "Assigned Engines",
      value: "3",
      helperText:
        "Retail, Learning, and Event engine routes are prepared in this beta.",
    },
    {
      label: "Common Features",
      value: "10",
      helperText:
        "Dashboard, roles, CRM, payments, invoices, reports, campaigns, logs, and exports.",
    },
    {
      label: "Client Access",
      value: "Ready",
      helperText:
        "Client access credentials are managed from the hidden CYT admin portal.",
    },
    {
      label: "Portal Status",
      value: "Beta",
      helperText:
        "Engine-specific modules are structured and ready for deeper database integration.",
    },
  ];

  const commonFeatures = [
    "Business owner dashboard",
    "User role management",
    "Customer / lead database",
    "Payment tracking",
    "Invoice and receipt records",
    "Date filter reports",
    "Campaign management",
    "Revenue reports",
    "Export reports",
    "Activity logs",
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/client/dashboard" className="inline-flex flex-col">
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>

            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Ecom Engine v.1 Client Dashboard
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <ClientButton href="/client/retail" variant="secondary">
              Retail
            </ClientButton>

            <ClientButton href="/client/learning" variant="secondary">
              Learning
            </ClientButton>

            <ClientButton href="/client/event" variant="secondary">
              Event
            </ClientButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Client Portal
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Select your commerce engine.
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Ecom Engine v.1 supports separate client experiences for Retail,
              Learning, and Event commerce operations. Your assigned engine
              decides which dashboard and features your team should use.
            </p>
          </div>

          <ClientButton href="/client/login" variant="secondary">
            Client Login
          </ClientButton>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6">
          <EngineCard
            title="Retail Commerce Engine"
            href="/client/retail"
            description="For businesses managing products, inventory, POS billing, orders, delivery, CRM, sales data, and reports."
            modules={[
              "Inventory Management",
              "Billing & Orders",
              "Delivery Management",
              "Sales Data",
              "Marketing & CRM",
              "Reports",
            ]}
          />

          <EngineCard
            title="Learning Commerce Engine"
            href="/client/learning"
            description="For businesses managing live programs, recorded programs, students, enrollments, payments, campaigns, and learning reports."
            modules={[
              "Program Management",
              "Student Management",
              "Sales Data",
              "Marketing & CRM",
              "Reports",
            ]}
          />

          <EngineCard
            title="Event Commerce Engine"
            href="/client/event"
            description="For businesses managing shows, events, tickets, entries, attendees, ticket sales, campaigns, and event reports."
            modules={[
              "Show/Event Management",
              "Entry Management",
              "Sales Data",
              "Marketing & CRM",
              "Reports",
            ]}
          />
        </div>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Common Features
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
              Available across all client engines
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
              Every Ecom Engine client portal includes common business
              operations features. The selected engine then adds its own
              dedicated modules.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {commonFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <span className="h-2 w-2 rounded-full bg-black" />
                <span className="text-sm font-medium text-neutral-700">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Access Rule
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
                Clients should only use their assigned engine.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
                The hidden admin Client Access workflow stores the selected
                engine, backend access route, user ID, role, permissions, and
                credentials. In the next security step, we will tighten routing
                so each client sees only their assigned engine.
              </p>
            </div>

            <div className="grid gap-3">
              <ClientButton href="/client/retail">Open Retail Engine</ClientButton>

              <ClientButton href="/client/learning" variant="secondary">
                Open Learning Engine
              </ClientButton>

              <ClientButton href="/client/event" variant="secondary">
                Open Event Engine
              </ClientButton>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}