import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecom Engine v.1 | CYT Nexus",
  description:
    "Ecom Engine v.1 by CYT Nexus is a ready-to-onboard commerce operations engine for products, inventory, POS, CRM, reports, and revenue-sharing business operations.",
};

const clientPortalFeatures = [
  "Store setup and business profile management",
  "Product and inventory management",
  "POS billing and offline sales",
  "Order and payment tracking",
  "Customer CRM and purchase history",
  "Reports and revenue-share visibility",
];

const engineDetails = [
  {
    title: "Backend-first commerce engine",
    description:
      "Built to manage the operational backend of a business, while the storefront can be customized based on each client’s brand and business model.",
  },
  {
    title: "Online and offline sales control",
    description:
      "Connect products, inventory, POS billing, online requests, orders, customers, payments, and reports from one structured system.",
  },
  {
    title: "Ready for revenue-sharing operations",
    description:
      "Designed for CYT Nexus client onboarding, business setup, sales tracking, revenue-share entries, and scalable client operations.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-8">
          <Link href="/" className="group inline-flex flex-col">
            <span className="text-2xl font-semibold tracking-[0.28em] text-black uppercase sm:text-3xl">
              CYT Nexus
            </span>
            <span className="mt-2 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Ecom Engine v.1
            </span>
          </Link>

          <Link
            href="/client/login"
            style={{ color: "#FFFFFF" }}
            className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold transition hover:bg-neutral-800"
          >
            Client Portal Login
          </Link>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Ready to Onboard. Ready to Sell. Built for Revenue Sharing.
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
              One backend engine for every commerce operation.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Ecom Engine v.1 is a minimal, scalable commerce operations
              platform for CYT Nexus clients. It helps businesses manage store
              setup, products, inventory, POS billing, orders, CRM, reports, and
              revenue-share workflows from one clean client portal.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/client/login"
                style={{ color: "#FFFFFF" }}
                className="inline-flex items-center justify-center rounded-full border border-black bg-black px-7 py-4 text-sm font-semibold transition hover:bg-neutral-800"
              >
                Login to Client Portal
              </Link>

              <Link
                href="/client/login"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-4 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-50"
              >
                Request Client Access
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
                Client Portal Login
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">
                Manage commerce operations from one place.
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Access the client dashboard to manage products, stock, POS,
                orders, customers, checkout requests, and reports.
              </p>

              <div className="mt-6">
                <Link
                  href="/client/login"
                  style={{ color: "#FFFFFF" }}
                  className="inline-flex w-full items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
                >
                  Client Portal Login
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {clientPortalFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                >
                  <span className="h-2 w-2 rounded-full bg-black" />
                  <span className="text-sm font-medium text-neutral-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
              Ecom Engine Details
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-black">
              Built for businesses that need control, not just a website.
            </h2>

            <p className="mt-5 text-sm leading-7 text-neutral-600">
              Ecom Engine v.1 focuses on business operations: products,
              inventory, POS, customers, orders, checkout requests, payments,
              revenue reports, and client-side store management.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {engineDetails.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-6"
              >
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-[1fr_0.55fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
              CYT Nexus Commerce Platform
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-black">
              Ready-to-onboard commerce backend for modern business operations.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600">
              The public home page focuses only on the Ecom Engine value
              proposition and the Client Portal login. CYT executive access is
              intentionally hidden from the home page.
            </p>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <p className="text-sm font-semibold text-black">
              Client access only
            </p>

            <p className="mt-3 text-sm leading-7 text-neutral-600">
              Business owners and staff can log in to manage store operations,
              products, inventory, POS, orders, customers, and reports.
            </p>

            <Link
              href="/client/login"
              style={{ color: "#FFFFFF" }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
            >
              Login to Client Portal
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white px-6 py-6">
        <p className="text-center text-xs text-neutral-500">
          CYT Nexus — Ecom Engine v.1. Ready to Onboard. Ready to Sell. Built
          for Revenue Sharing.
        </p>
      </footer>
    </main>
  );
}