import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Learning Commerce Engine | Ecom Engine v.1 | CYT Nexus",
  description:
    "Learning Commerce Engine client dashboard for live programs, recorded programs, students, enrollments, payments, CRM, campaigns, and reports.",
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

function ModuleCard({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-neutral-600">{description}</p>

      <div className="mt-5 space-y-3">
        {features.map((feature) => (
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

      <div className="mt-6">
        <ClientButton href="/client/learning" variant="secondary">
          Module Coming Soon
        </ClientButton>
      </div>
    </div>
  );
}

export default function LearningCommerceEnginePage() {
  const learningMetrics = [
    {
      label: "Total Programs",
      value: "0",
      helperText: "Live and recorded programs created in this engine.",
    },
    {
      label: "Live Programs",
      value: "0",
      helperText: "Active live training or session-based programs.",
    },
    {
      label: "Recorded Programs",
      value: "0",
      helperText: "Pre-recorded learning programs available for students.",
    },
    {
      label: "Total Students",
      value: "0",
      helperText: "Students added or enrolled into programs.",
    },
    {
      label: "New Enrollments",
      value: "0",
      helperText: "Recent student enrollments awaiting tracking.",
    },
    {
      label: "Total Revenue",
      value: "₹0",
      helperText: "Learning commerce revenue from program sales.",
    },
    {
      label: "Pending Payments",
      value: "0",
      helperText: "Students or enrollments with payment pending.",
    },
    {
      label: "Campaign Leads",
      value: "0",
      helperText: "Marketing and CRM leads for learning programs.",
    },
  ];

  const learningModules = [
    {
      title: "Program Management",
      description:
        "Launch, create, edit, and manage live programs, recorded programs, categories, pricing, and program status.",
      features: [
        "Launch program",
        "Create live program",
        "Create recorded program",
        "Edit/manage program",
        "Program category",
        "Program pricing",
        "Program status",
      ],
    },
    {
      title: "Student Management",
      description:
        "Add and manage students, profiles, enrollment details, payment status, batch allocation, and progress status.",
      features: [
        "Add/manage students",
        "Student profile",
        "Enrollment details",
        "Payment status",
        "Batch allocation",
        "Student progress status",
      ],
    },
    {
      title: "Sales Data",
      description:
        "Track program-wise sales, live program sales, recorded program sales, enrollment revenue, pending payments, and date filters.",
      features: [
        "Program-wise sales",
        "Live program sales",
        "Recorded program sales",
        "Student enrollment revenue",
        "Payment pending list",
        "Date filter",
      ],
    },
    {
      title: "Marketing & CRM",
      description:
        "Manage lead database, student follow-ups, campaign creation, WhatsApp/email communication, interested leads, and converted students.",
      features: [
        "Lead database",
        "Student follow-up",
        "Campaign creation",
        "WhatsApp/email communication",
        "Interested leads",
        "Converted students",
      ],
    },
    {
      title: "Reports",
      description:
        "View program sales reports, student reports, revenue reports, enrollment reports, pending payment reports, and date-wise reports.",
      features: [
        "Program sales report",
        "Student report",
        "Revenue report",
        "Enrollment report",
        "Pending payment report",
        "Date-wise report",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/client/learning" className="inline-flex flex-col">
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>

            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Learning Commerce Engine
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <ClientButton href="/client/learning" variant="secondary">
              Programs
            </ClientButton>

            <ClientButton href="/client/learning">Students</ClientButton>

            <ClientButton href="/client/learning" variant="secondary">
              Reports
            </ClientButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Client Portal · Learning Commerce Engine
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Learning operations dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Manage live programs, recorded programs, students, enrollments,
              payments, learning CRM, campaigns, and revenue reports from one
              dedicated client engine dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Top-Selling Program
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-black">
              Not available yet
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Learning Revenue Trend
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Program sales snapshot
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Beta graph placeholder for learning revenue. Program-specific
                  database and date filters will be connected later.
                </p>
              </div>

              <ClientButton href="/client/learning" variant="secondary">
                View Learning Reports
              </ClientButton>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Program Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  ₹0
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Active Batches
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  0
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Pending Payment
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  ₹0
                </p>
              </div>
            </div>

            <div className="mt-6 h-56 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex h-full items-end gap-4">
                {[20, 36, 48, 42, 62, 78].map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end rounded-t-2xl"
                  >
                    <div
                      className="w-full rounded-t-2xl bg-black"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Quick Actions
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Learning workflow shortcuts
            </h2>

            <div className="mt-6 grid gap-3">
              <ClientButton href="/client/learning">
                Create Program
              </ClientButton>

              <ClientButton href="/client/learning" variant="secondary">
                Manage Students
              </ClientButton>

              <ClientButton href="/client/learning">
                Add Enrollment
              </ClientButton>

              <ClientButton href="/client/learning" variant="secondary">
                Payment Pending List
              </ClientButton>

              <ClientButton href="/client/learning" variant="secondary">
                Campaign Leads
              </ClientButton>

              <ClientButton href="/client/learning">
                Learning Reports
              </ClientButton>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Learning Modules
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
              Features available in this engine
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {learningModules.map((module) => (
              <ModuleCard
                key={module.title}
                title={module.title}
                description={module.description}
                features={module.features}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}