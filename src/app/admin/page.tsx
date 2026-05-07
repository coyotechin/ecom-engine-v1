import Link from "next/link";

const adminModules = [
  "Dashboard",
  "Ticket Management",
  "Customer Onboarding",
  "Business Profile Setup",
  "Client Access Management",
  "Revenue Share Configuration",
  "Store Launch Checklist",
  "CRM",
  "Reports",
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
                CYT Executive Exclusive
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-black sm:text-5xl">
                Admin Portal
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
            >
              Back Home
            </Link>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-600">
            This portal will help CYT Nexus executives manage onboarding
            tickets, customer requirements, business setup, access creation,
            revenue-share configuration, CRM, and reports.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          {adminModules.map((module) => (
            <div
              key={module}
              className="rounded-3xl border border-neutral-200 bg-white p-6"
            >
              <p className="text-sm font-medium text-neutral-500">
                Admin Module
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-black">
                {module}
              </h2>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}