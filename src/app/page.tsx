import Link from "next/link";

const portals = [
  {
    title: "CYT Executive Portal",
    route: "/admin",
    description:
      "Manage onboarding tickets, client access, revenue-share setup, CRM, and CYT Nexus reports.",
  },
  {
    title: "Client Portal",
    route: "/client",
    description:
      "Manage store setup, products, inventory, POS billing, orders, CRM, campaigns, and reports.",
  },
  {
    title: "Customer Storefront",
    route: "/store/demo-store",
    description:
      "Browse products, add to cart, checkout, and track customer orders through the live storefront.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-neutral-200">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
                CYT Nexus
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-black">
                Ecom Engine v.1
              </h1>
            </div>

            <div className="hidden rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 sm:block">
              Development Build
            </div>
          </header>

          <div className="grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700">
                Ready to Onboard. Ready to Sell. Built for Revenue Sharing.
              </div>

              <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.05em] text-black sm:text-6xl lg:text-7xl">
                One commerce engine for onboarding, operations, and storefronts.
              </h2>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
                Ecom Engine v.1 is a minimal, scalable commerce operations
                platform for CYT Nexus. It connects onboarding, client store
                management, inventory, POS, CRM, reports, and customer shopping
                into one structured system.
              </p>
            </div>

            <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
                v.1 Scope Priority
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "CYT executive onboarding portal",
                  "Client dashboard and store setup",
                  "Product and inventory management",
                  "POS billing and order management",
                  "CRM and revenue-share reports",
                  "Customer storefront with cart and checkout",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                  >
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span className="text-sm font-medium text-neutral-800">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="grid gap-4 pb-8 md:grid-cols-3">
            {portals.map((portal) => (
              <Link
                key={portal.route}
                href={portal.route}
                className="group rounded-[1.5rem] border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-black hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-black">
                    {portal.title}
                  </h3>
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition group-hover:border-black group-hover:text-black">
                    Open
                  </span>
                </div>

                <p className="mt-4 min-h-24 text-sm leading-6 text-neutral-600">
                  {portal.description}
                </p>

                <p className="mt-6 text-sm font-semibold text-black">
                  {portal.route}
                </p>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}