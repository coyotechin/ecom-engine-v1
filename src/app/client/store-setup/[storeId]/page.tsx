import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStoreSetupAction } from "@/app/client/store-setup/[storeId]/actions";
import { createClient } from "@/lib/supabase/server";
import { clientNavigation } from "@/config/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type StoreSetupEditPageProps = {
  params: Promise<{
    storeId: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

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
  updated_at: string;
  businesses:
    | {
        business_name: string;
        owner_name: string;
        engine_type: EngineType;
      }
    | null;
};

const statusOptions = [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Submit for Review",
    value: "review",
  },
  {
    label: "Live",
    value: "live",
  },
  {
    label: "Paused",
    value: "paused",
  },
  {
    label: "Closed",
    value: "closed",
  },
];

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

export default async function StoreSetupEditPage({
  params,
  searchParams,
}: StoreSetupEditPageProps) {
  const { storeId } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("stores")
    .select(
      "id, business_id, store_name, store_slug, store_logo_url, store_banner_url, brand_description, contact_number, whatsapp_number, email, business_address, delivery_areas, payment_methods, return_policy, privacy_policy, terms_and_conditions, status, created_at, updated_at, businesses(business_name, owner_name, engine_type)",
    )
    .eq("id", storeId)
    .single();

  if (fetchError || !data) {
    notFound();
  }

  const store = data as unknown as StoreRow;
  const score = completionScore(store);

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Continue Store Setup"
      description="Update store branding, contact details, delivery settings, payment methods, policies, and launch status."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(store.status)}>
                {formatStatus(store.status)}
              </Badge>

              <Badge variant="outline">{score}% Setup Complete</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {store.store_name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Business: {store.businesses?.business_name || "Not linked"} ·
              Owner: {store.businesses?.owner_name || "Not set"} · Engine:{" "}
              {formatEngine(store.businesses?.engine_type)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/store-setup" variant="outline">
              Back to Store Setup
            </Button>

            <Button href={`/store/${store.store_slug}`} variant="secondary">
              Preview Store
            </Button>
          </div>
        </section>

        {success ? (
          <div className="rounded-3xl border border-black bg-white p-5">
            <p className="text-sm font-semibold text-black">Success</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {success}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Store update failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <form action={updateStoreSetupAction} className="space-y-6">
          <input type="hidden" name="storeId" value={store.id} />
          <input type="hidden" name="businessId" value={store.business_id} />

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Store Identity</CardTitle>
              <CardDescription>
                Basic storefront identity and public URL path.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="storeName"
                name="storeName"
                label="Store Name"
                defaultValue={store.store_name}
                required
              />

              <Input
                id="storeSlug"
                name="storeSlug"
                label="Store Slug"
                defaultValue={store.store_slug}
                helperText="Example: abc-boutique. This becomes /store/abc-boutique"
                required
              />

              <Input
                id="storeLogoUrl"
                name="storeLogoUrl"
                label="Store Logo URL"
                defaultValue={store.store_logo_url || ""}
                placeholder="Image upload will be added later. Use URL for now."
              />

              <Input
                id="storeBannerUrl"
                name="storeBannerUrl"
                label="Store Banner URL"
                defaultValue={store.store_banner_url || ""}
                placeholder="Image upload will be added later. Use URL for now."
              />

              <Textarea
                id="brandDescription"
                name="brandDescription"
                label="Brand Description"
                defaultValue={store.brand_description || ""}
                placeholder="Short introduction about the store and what it sells."
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Contact and Address</CardTitle>
              <CardDescription>
                These details will appear in the customer storefront and order
                support flow.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="contactNumber"
                name="contactNumber"
                label="Contact Number"
                defaultValue={store.contact_number || ""}
              />

              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                label="WhatsApp Number"
                defaultValue={store.whatsapp_number || ""}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                defaultValue={store.email || ""}
              />

              <Textarea
                id="businessAddress"
                name="businessAddress"
                label="Business Address"
                defaultValue={store.business_address || ""}
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Delivery and Payment</CardTitle>
              <CardDescription>
                Configure serviceable areas and payment methods for the store.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Textarea
                id="deliveryAreas"
                name="deliveryAreas"
                label="Delivery Areas"
                defaultValue={store.delivery_areas || ""}
                placeholder="Example: Chennai, Tambaram, Velachery"
              />

              <Textarea
                id="paymentMethods"
                name="paymentMethods"
                label="Payment Methods"
                defaultValue={store.payment_methods || ""}
                placeholder="Example: COD, UPI, Razorpay"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
              <CardDescription>
                Add basic policy content required before launch review.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Textarea
                id="returnPolicy"
                name="returnPolicy"
                label="Return Policy"
                defaultValue={store.return_policy || ""}
              />

              <Textarea
                id="privacyPolicy"
                name="privacyPolicy"
                label="Privacy Policy"
                defaultValue={store.privacy_policy || ""}
              />

              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                label="Terms and Conditions"
                defaultValue={store.terms_and_conditions || ""}
              />

              <Select
                id="status"
                name="status"
                label="Store Status"
                options={statusOptions}
                defaultValue={store.status}
                helperText="Use Review when the store is ready for CYT Nexus launch check."
                required
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-black">
                Save store setup
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Changes will be saved directly to Supabase.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/client/store-setup" variant="outline">
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                Save Store Setup
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}