import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "CYT Executive Login | Ecom Engine v.1",
  description:
    "Hidden CYT Nexus executive login page for Ecom Engine v.1 admin operations, onboarding, tickets, revenue, reports, and client access management.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

async function adminLoginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect(
      `/admin/cytnexus.com?error=${encodeURIComponent(
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
    redirect(`/admin/cytnexus.com?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/cytnexus.com/dashboard");
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
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
              Ecom Engine v.1 Admin
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
              Hidden CYT Executive Access
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
              Admin access for CYT Nexus operations.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              This hidden portal is for CYT Nexus executives to manage
              onboarding tickets, customer setup, client access, revenue-share
              configuration, reports, CRM, and Ecom Engine operations.
            </p>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                "Ticket management",
                "Customer onboarding",
                "Client access setup",
                "Revenue-share tracking",
                "Admin reports",
                "Internal activity control",
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
                CYT Executive Portal
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">
                Admin Login
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Enter your authorized CYT Nexus admin email and password to
                continue.
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
                  Admin login failed
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {error}
                </p>
              </div>
            ) : null}

            <form action={adminLoginAction} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-black"
                >
                  Admin Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@cytnexus.com"
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
                  placeholder="Enter admin password"
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black"
                />
              </div>

              <button
                type="submit"
                style={{ color: "#FFFFFF" }}
                className="inline-flex w-full items-center justify-center rounded-full border border-black bg-black px-6 py-4 text-sm font-semibold transition hover:bg-neutral-800"
              >
                Login to Admin Portal
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-black">
                Internal access only
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                This page is intentionally hidden from the public homepage and
                must be used only by authorized CYT Nexus team members.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}