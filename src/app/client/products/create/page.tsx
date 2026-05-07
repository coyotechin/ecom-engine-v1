import { createProductAction } from "@/app/client/products/create/actions";
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

type CreateProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

type BusinessRow = {
  id: string;
  business_name: string;
};

type StoreRow = {
  id: string;
  business_id: string;
  store_name: string;
  store_slug: string;
  status: string;
  businesses:
    | {
        business_name: string;
      }
    | null;
};

const statusOptions = [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "Archived",
    value: "archived",
  },
];

export default async function CreateProductPage({
  searchParams,
}: CreateProductPageProps) {
  const { error } = await searchParams;

  const supabase = await createClient();

  const [{ data: businessData }, { data: storeData }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, business_name")
      .order("created_at", { ascending: false }),

    supabase
      .from("stores")
      .select("id, business_id, store_name, store_slug, status, businesses(business_name)")
      .order("created_at", { ascending: false }),
  ]);

  const businesses = (businessData || []) as BusinessRow[];
  const stores = (storeData || []) as unknown as StoreRow[];

  const businessOptions = businesses.map((business) => ({
    label: business.business_name,
    value: business.id,
  }));

  const storeOptions = stores.map((store) => ({
    label: `${store.store_name} — ${
      store.businesses?.business_name || "Business"
    }`,
    value: store.id,
  }));

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Create Product"
      description="Add a new product to the client catalogue and create its initial inventory stock record."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Product Management</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              New Product
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Create a product with pricing, category, SKU, visibility,
              storefront status, and initial stock.
            </p>
          </div>

          <Button href="/client/products" variant="outline">
            Back to Products
          </Button>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Product creation failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        {businesses.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-black">
              No business profile found
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
              Create a client business from an approved onboarding ticket before
              adding products.
            </p>

            <div className="mt-6">
              <Button href="/admin/onboarding" variant="primary">
                Go to Admin Onboarding
              </Button>
            </div>
          </div>
        ) : (
          <form action={createProductAction} className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Business and Store</CardTitle>
                <CardDescription>
                  Select which business and store this product belongs to.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-5 md:grid-cols-2">
                <Select
                  id="businessId"
                  name="businessId"
                  label="Business"
                  options={businessOptions}
                  placeholder="Choose business"
                  required
                />

                <Select
                  id="storeId"
                  name="storeId"
                  label="Store"
                  options={storeOptions}
                  placeholder="Choose store"
                  helperText="Optional, but recommended for storefront and inventory tracking."
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Product Identity</CardTitle>
                <CardDescription>
                  Basic product name, slug, category, SKU, and barcode.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  id="productName"
                  name="productName"
                  label="Product Name"
                  placeholder="Example: Premium Cotton Shirt"
                  required
                />

                <Input
                  id="productSlug"
                  name="productSlug"
                  label="Product Slug"
                  placeholder="premium-cotton-shirt"
                  helperText="Optional. If empty, slug will be generated from product name."
                />

                <Input
                  id="categoryName"
                  name="categoryName"
                  label="Category Name"
                  placeholder="Example: Shirts"
                  helperText="If category does not exist, it will be created."
                />

                <Input
                  id="sku"
                  name="sku"
                  label="SKU"
                  placeholder="Example: SHIRT-001"
                />

                <Input
                  id="barcode"
                  name="barcode"
                  label="Barcode"
                  placeholder="Optional barcode value"
                />

                <Input
                  id="mainImageUrl"
                  name="mainImageUrl"
                  label="Main Image URL"
                  placeholder="Image upload will be added later. Use URL for now."
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Product Content</CardTitle>
                <CardDescription>
                  Add short and detailed descriptions for the product.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-5 md:grid-cols-2">
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  label="Short Description"
                  placeholder="One-line product summary."
                />

                <Textarea
                  id="description"
                  name="description"
                  label="Full Description"
                  placeholder="Detailed product description for storefront and sales staff."
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set product price, comparison price, cost, tax, and discount.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  id="price"
                  name="price"
                  label="Selling Price"
                  placeholder="Example: 999"
                  inputMode="decimal"
                  required
                />

                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  label="Compare At Price"
                  placeholder="Example: 1299"
                  inputMode="decimal"
                />

                <Input
                  id="costPrice"
                  name="costPrice"
                  label="Cost Price"
                  placeholder="Example: 650"
                  inputMode="decimal"
                />

                <Input
                  id="taxPercentage"
                  name="taxPercentage"
                  label="Tax Percentage"
                  placeholder="Example: 18"
                  inputMode="decimal"
                />

                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  label="Discount Percentage"
                  placeholder="Example: 10"
                  inputMode="decimal"
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Inventory and Visibility</CardTitle>
                <CardDescription>
                  Add opening stock and decide where the product should appear.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  id="initialStock"
                  name="initialStock"
                  label="Initial Stock"
                  placeholder="Example: 50"
                  inputMode="numeric"
                />

                <Input
                  id="lowStockAlert"
                  name="lowStockAlert"
                  label="Low Stock Alert"
                  placeholder="Example: 5"
                  inputMode="numeric"
                />

                <Select
                  id="status"
                  name="status"
                  label="Product Status"
                  options={statusOptions}
                  defaultValue="draft"
                  required
                />

                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <input
                    type="checkbox"
                    name="isOnlineVisible"
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-sm font-medium text-black">
                    Show product online
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-sm font-medium text-black">
                    Mark as featured
                  </span>
                </label>
              </div>
            </Card>

            <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-black">
                  Save product
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Product and initial inventory record will be saved to Supabase.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button href="/client/products" variant="outline">
                  Cancel
                </Button>

                <Button type="submit" variant="primary">
                  Create Product
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}