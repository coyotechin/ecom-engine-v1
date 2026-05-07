import Link from "next/link";
import { ReactNode } from "react";
import { NavItem } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  portalName: string;
  portalLabel: string;
  description: string;
  navigation: NavItem[];
  children: ReactNode;
};

export function DashboardShell({
  portalName,
  portalLabel,
  description,
  navigation,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-neutral-200 bg-white">
          <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
            <Link
              href="/"
              className="block rounded-3xl border border-neutral-200 p-5"
            >
              <p className="text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
                CYT Nexus
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                Ecom Engine
              </h1>
              <p className="mt-2 text-xs text-neutral-500">v.1 Development</p>
            </Link>

            <nav className="mt-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-200 hover:bg-neutral-50 hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <Badge variant="dark">v.1 Priority</Badge>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Build onboarding, tickets, client setup, inventory, POS, CRM,
                storefront, and revenue-share reports first.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-neutral-200 bg-white">
            <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
                  {portalLabel}
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-black">
                  {portalName}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                  {description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button href="/" variant="outline">
                  Home
                </Button>
                <Button href="/client" variant="secondary">
                  Client Portal
                </Button>
              </div>
            </div>
          </header>

          <div className="px-6 py-8 sm:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}