import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Event Commerce Engine | Ecom Engine v.1 | CYT Nexus",
  description:
    "Event Commerce Engine client dashboard for shows, events, tickets, entries, attendees, ticket sales, CRM, campaigns, and reports.",
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
        <ClientButton href="/client/event" variant="secondary">
          Module Coming Soon
        </ClientButton>
      </div>
    </div>
  );
}

export default function EventCommerceEnginePage() {
  const eventMetrics = [
    {
      label: "Total Events",
      value: "0",
      helperText: "All shows or events created in this engine.",
    },
    {
      label: "Active Events",
      value: "0",
      helperText: "Events currently open for booking or entry management.",
    },
    {
      label: "Tickets Sold",
      value: "0",
      helperText: "Total tickets booked across events.",
    },
    {
      label: "Available Seats",
      value: "0",
      helperText: "Remaining seat capacity across active events.",
    },
    {
      label: "Total Revenue",
      value: "₹0",
      helperText: "Event revenue generated from ticket bookings.",
    },
    {
      label: "Today’s Bookings",
      value: "0",
      helperText: "Tickets booked today across active events.",
    },
    {
      label: "Pending Payments",
      value: "0",
      helperText: "Bookings with payment still pending.",
    },
    {
      label: "Checked-in Attendees",
      value: "0",
      helperText: "Attendees already validated or checked in.",
    },
  ];

  const eventModules = [
    {
      title: "Show/Event Management",
      description:
        "Create and manage show or event details, event date/time, venue, ticket price, seat limit, and event status.",
      features: [
        "Create show/event",
        "Manage event details",
        "Event date/time",
        "Venue",
        "Ticket price",
        "Seat limit",
        "Event status",
      ],
    },
    {
      title: "Entry Management",
      description:
        "Manage attendee entries, ticket confirmations, check-in status, entry validation, cancellations, and refunds.",
      features: [
        "Manage entries",
        "Attendee list",
        "Ticket confirmation",
        "Check-in status",
        "Entry validation",
        "Cancellation/refund status",
      ],
    },
    {
      title: "Sales Data",
      description:
        "Track ticket sales, event-wise revenue, entry count, booked seats, available seats, payment status, and date filters.",
      features: [
        "Ticket sales",
        "Event-wise revenue",
        "Entry count",
        "Booked seats",
        "Available seats",
        "Payment status",
        "Date filter",
      ],
    },
    {
      title: "Marketing & CRM",
      description:
        "Manage attendee database, interested leads, campaign creation, WhatsApp/email promotion, and follow-up reminders.",
      features: [
        "Attendee database",
        "Interested leads",
        "Campaign creation",
        "WhatsApp/email promotion",
        "Follow-up reminders",
      ],
    },
    {
      title: "Reports",
      description:
        "View ticket sales reports, event revenue reports, attendee reports, booking reports, cancellation reports, and date-wise reports.",
      features: [
        "Ticket sales report",
        "Event revenue report",
        "Attendee report",
        "Booking report",
        "Cancellation report",
        "Date-wise report",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/client/event" className="inline-flex flex-col">
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>

            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Event Commerce Engine
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <ClientButton href="/client/event" variant="secondary">
              Events
            </ClientButton>

            <ClientButton href="/client/event">Entries</ClientButton>

            <ClientButton href="/client/event" variant="secondary">
              Reports
            </ClientButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Client Portal · Event Commerce Engine
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Event operations dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Manage shows, events, ticket bookings, entries, attendees,
              check-ins, payment status, event CRM, campaigns, and event revenue
              reports from one dedicated client engine dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Top-Performing Event
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-black">
              Not available yet
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {eventMetrics.map((metric) => (
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
                  Event Revenue Trend
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Ticket sales snapshot
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Beta graph placeholder for event revenue. Event-specific
                  database and date filters will be connected later.
                </p>
              </div>

              <ClientButton href="/client/event" variant="secondary">
                View Event Reports
              </ClientButton>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Ticket Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  ₹0
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Cancelled Tickets
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  0
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Checked-in Attendees
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  0
                </p>
              </div>
            </div>

            <div className="mt-6 h-56 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex h-full items-end gap-4">
                {[28, 44, 58, 40, 72, 88].map((height, index) => (
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
              Event workflow shortcuts
            </h2>

            <div className="mt-6 grid gap-3">
              <ClientButton href="/client/event">Create Event</ClientButton>

              <ClientButton href="/client/event" variant="secondary">
                Manage Entries
              </ClientButton>

              <ClientButton href="/client/event">Ticket Bookings</ClientButton>

              <ClientButton href="/client/event" variant="secondary">
                Attendee List
              </ClientButton>

              <ClientButton href="/client/event" variant="secondary">
                Campaign Leads
              </ClientButton>

              <ClientButton href="/client/event">Event Reports</ClientButton>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Event Modules
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
              Features available in this engine
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {eventModules.map((module) => (
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