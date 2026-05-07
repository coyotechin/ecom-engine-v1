import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-between border-r border-neutral-200 bg-neutral-50 px-6 py-8 sm:px-10 lg:px-12">
          <div>
            <Link href="/" className="inline-block">
              <p className="text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
                CYT Nexus
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                Ecom Engine v.1
              </h1>
            </Link>
          </div>

          <div className="py-16">
            <Badge variant="dark">Secure Access</Badge>

            <h2 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-black sm:text-6xl">
              Sign in to manage onboarding, stores, POS, CRM, and revenue.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
              Ecom Engine v.1 uses role-based access for CYT executives, client
              owners, store staff, and customers. Supabase authentication will
              control who can access each portal.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "CYT Executive Portal",
                "Client Business Portal",
                "Store Management",
                "Revenue Share Reports",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-neutral-800">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-neutral-500">
            Ready to Onboard. Ready to Sell. Built for Revenue Sharing.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
          <Card className="w-full max-w-md shadow-none">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email and password to access your Ecom Engine portal.
                Login functionality will be connected to Supabase in the next
                development step.
              </CardDescription>
            </CardHeader>

            <form className="space-y-5">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="admin@cytnexus.com"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter password"
              />

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-black">
                  Current status
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Login UI is ready. Supabase sign-in action will be added next.
                </p>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Sign In
              </Button>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <Link
                  href="/"
                  className="text-sm font-medium text-neutral-600 transition hover:text-black"
                >
                  Back to Home
                </Link>

                <Link
                  href="/admin"
                  className="text-sm font-medium text-neutral-600 transition hover:text-black"
                >
                  View Admin Preview
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}