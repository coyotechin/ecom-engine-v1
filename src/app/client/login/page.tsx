import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Client Login | Ecom Engine v.1 | CYT Nexus",
  description:
    "Client Portal Login for Ecom Engine v.1 by CYT Nexus. Manage store setup, products, inventory, POS, orders, CRM, reports, and checkout requests.",
};

type ClientLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

async function clientLoginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect(
      `/client/login?error=${encodeURIComponent(
        "Please enter both email and password.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/client/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/client");
}

export default async function ClientLoginPage({
  searchParams,
}: ClientLoginPageProps) {
  const { error, success } = await searchParams;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-8">
          <Link href="/" className="inline-flex flex-col">
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>
            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Ecom Engine v.1
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-50"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-neutral-50">
        <div className="mx-auto grid min-h-[calc(100vh-113px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Client Portal Access
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
              Login to manage your commerce engine.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Access your Ecom Engine v.1 client dashboard to manage store
              setup, products, inventory, POS billing, orders, customers,
              checkout requests, reports, and revenue-share visibility.
            </p>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                "Store setup",
                "Product management",
                "Inventory control",
                "POS billing",
                "Order tracking",
                "CRM and reports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                >
                  <span className="h-2 w-2 rounded-full bg-black" />
                  <span className="text-sm font-medium text-neutral-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
                Ecom Engine v.1
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">
                Client Portal Login
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Enter your registered client email and password to continue to
                your business dashboard.
              </p>
            </div>

            {success ? (
              <div className="mt-5 rounded-3xl border border-black bg-white p-5">
                <p className="text-sm font-semibold text-black">Success</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {success}
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
                <p className="text-sm font-semibold text-black">
                  Login failed
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {error}
                </p>
              </div>
            ) : null}

            <form action={clientLoginAction} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-black"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="client@example.com"
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-black"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                />
              </div>

              <button
                type="submit"
                style={{ color: "#FFFFFF" }}
                className="inline-flex w-full items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
              >
                Login to Client Portal
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-black">
                Client access only
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                This login is for onboarded Ecom Engine v.1 business owners and
                assigned staff. CYT Nexus admin access will be handled through a
                separate hidden route.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}