import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { clientNavigation } from "@/config/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StoreStatus = "draft" | "review" | "live" | "paused" | "closed";
type EngineType = "retail" | "learning" | "event";

type StoreRow = {
  id: string;
  business_id: string;
  store_name: string;
  store_slug: string;
  store_logo_url: string | null;
  store_banner_url: string | null;
  brand_description: string | null;
  contact_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  business_address: string | null;
  delivery_areas: string | null;
  payment_methods: string | null;
  return_policy: string | null;
  privacy_policy: string | null;
  terms_and_conditions: string | null;
  status: StoreStatus;
  created_at: string;
  businesses:
    | {
        business_name: string;
        owner_name: string;
        engine_type: EngineType;
      }
    | null;
};

function formatStatus(status: StoreStatus) {
  const labels: Record<StoreStatus, string> = {
    draft: "Draft",
    review: "Review",
    live: "Live",
    paused: "Paused",
    closed: "Closed",
  };

  return labels[status];
}

function formatEngine(engine: EngineType | undefined) {
  const labels: Record<EngineType, string> = {
    retail: "Retail Commerce Engine",
    learning: "Learning Commerce Engine",
    event: "Event Commerce Engine",
  };

  return engine ? labels[engine] : "Engine not set";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusVariant(status: StoreStatus) {
  if (status === "live") {
    return "dark" as const;
  }

  if (status === "review") {
    return "outline" as const;
  }

  return "muted" as const;
}

function completionScore(store: StoreRow) {
  const fields = [
    store.store_name,
    store.store_slug,
    store.brand_description,
    store.contact_number,
    store.whatsapp_number,
    store.email,
    store.business_address,
    store.delivery_areas,
    store.payment_methods,
    store.return_policy,
    store.privacy_policy,
    store.terms_and_conditions,
  ];

  const completedFields = fields.filter(Boolean).length;

  return Math.round((completedFields / fields.length) * 100);
}

function SetupItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-black">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function ClientStoreSetupPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, business_id, store_name, store_slug, store_logo_url, store_banner_url, brand_description, contact_number, whatsapp_number, email, business_address, delivery_areas, payment_methods, return_policy, privacy_policy, terms_and_conditions, status, created_at, businesses(business_name, owner_name, engine_type)",
    )
    .order("created_at", { ascending: false });

  const stores = (data || []) as unknown as StoreRow[];

  const draftStores = stores.filter((store) => store.status === "draft");
  const reviewStores = stores.filter((store) => store.status === "review");
  const liveStores = stores.filter((store) => store.status === "live");

  const setupMetrics = [
    {
      label: "Total Stores",
      value: String(stores.length),
      helperText: "Store records available for setup and launch.",
    },
    {
      label: "Draft Stores",
      value: String(draftStores.length),
      helperText: "Stores created but not submitted for review.",
    },
    {
      label: "In Review",
      value: String(reviewStores.length),
      helperText: "Stores waiting for CYT Nexus launch review.",
    },
    {
      label: "Live Stores",
      value: String(liveStores.length),
      helperText: "Stores currently marked as live.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Store Setup"
      description="View draft stores, brand details, contact information, delivery settings, payment methods, policies, and launch readiness."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Portal</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Store Setup Overview
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This page displays stores created during CYT Nexus onboarding. The
              next step will allow clients to edit store details and submit the
              store for review.
            </p>
          </div>

          <Button href="/client" variant="outline">
            Back to Client Dashboard
          </Button>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load store setup data
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {setupMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Store Setup Records</CardTitle>
            <CardDescription>
              Live store records from Supabase. Draft stores are created by CYT
              Nexus after converting approved onboarding tickets into business
              profiles.
            </CardDescription>
          </CardHeader>

          {stores.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-black">
                No store records found
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create a business from an approved onboarding ticket first. The
                draft store will then appear here for client setup.
              </p>

              <div className="mt-6">
                <Button href="/admin/onboarding" variant="primary">
                  Go to Admin Onboarding
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {stores.map((store) => {
                const score = completionScore(store);

                return (
                  <div
                    key={store.id}
                    className="rounded-3xl border border-neutral-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusVariant(store.status)}>
                            {formatStatus(store.status)}
                          </Badge>

                          <Badge variant="outline">
                            {score}% Setup Complete
                          </Badge>
                        </div>

                        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                          {store.store_name}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          Business:{" "}
                          {store.businesses?.business_name || "Not linked"}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Owner: {store.businesses?.owner_name || "Not set"}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Engine: {formatEngine(store.businesses?.engine_type)}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Created: {formatDate(store.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/store/${store.store_slug}`}
                          className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
                        >
                          Preview Store
                        </Link>

                        <Button
                          href={`/client/store-setup/${store.id}`}
                          variant="primary"
                        >
                          Continue Setup
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <SetupItem label="Store URL" value={`/store/${store.store_slug}`} />
                      <SetupItem label="Contact Number" value={store.contact_number} />
                      <SetupItem label="WhatsApp Number" value={store.whatsapp_number} />
                      <SetupItem label="Email" value={store.email} />
                      <SetupItem label="Delivery Areas" value={store.delivery_areas} />
                      <SetupItem label="Payment Methods" value={store.payment_methods} />
                    </div>

                    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                      <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Brand Description
                      </p>
                      <p className="mt-2 text-sm leading-7 text-neutral-700">
                        {store.brand_description ||
                          "Brand description not added yet."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}