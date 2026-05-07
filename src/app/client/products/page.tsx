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

type ProductStatus = "draft" | "active" | "inactive" | "archived";

type ProductRow = {
  id: string;
  business_id: string;
  store_id: string | null;
  category_id: string | null;
  product_name: string;
  product_slug: string;
  sku: string | null;
  barcode: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  tax_percentage: number;
  discount_percentage: number;
  main_image_url: string | null;
  status: ProductStatus;
  is_online_visible: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
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

function formatStatus(status: ProductStatus) {
  const labels: Record<ProductStatus, string> = {
    draft: "Draft",
    active: "Active",
    inactive: "Inactive",
    archived: "Archived",
  };

  return labels[status];
}

function getStatusVariant(status: ProductStatus) {
  if (status === "active") {
    return "dark" as const;
  }

  if (status === "draft") {
    return "outline" as const;
  }

  return "muted" as const;
}

export default async function ClientProductsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, business_id, store_id, category_id, product_name, product_slug, sku, barcode, short_description, description, price, compare_at_price, cost_price, tax_percentage, discount_percentage, main_image_url, status, is_online_visible, is_featured, is_active, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const products = (data || []) as ProductRow[];

  const activeProducts = products.filter((product) => product.status === "active");
  const draftProducts = products.filter((product) => product.status === "draft");
  const onlineProducts = products.filter(
    (product) => product.is_online_visible,
  );
  const featuredProducts = products.filter((product) => product.is_featured);

  const productMetrics = [
    {
      label: "Total Products",
      value: String(products.length),
      helperText: "All product records available in Supabase.",
    },
    {
      label: "Active Products",
      value: String(activeProducts.length),
      helperText: "Products currently marked as active.",
    },
    {
      label: "Online Visible",
      value: String(onlineProducts.length),
      helperText: "Products enabled for customer storefront visibility.",
    },
    {
      label: "Draft Products",
      value: String(draftProducts.length),
      helperText: "Products created but not ready for sale yet.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Product Management"
      description="Create, organize, publish, and manage products for storefront, POS billing, inventory, and order workflows."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Products
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Manage the client product catalogue. Products added here will
              later connect with inventory, POS billing, online orders, and the
              customer storefront.
            </p>
          </div>

          <Button href="/client/products/create" variant="primary">
            Create Product
          </Button>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load products
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {productMetrics.map((metric) => (
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
            <CardTitle>Product Catalogue</CardTitle>
            <CardDescription>
              Live product records from Supabase. The create product workflow
              will be added in the next micro step.
            </CardDescription>
          </CardHeader>

          {products.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-black">
                No products found
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Create your first product to start building the store catalogue.
                Product creation will connect to inventory, POS, and storefront
                visibility in the next steps.
              </p>

              <div className="mt-6">
                <Button href="/client/products/create" variant="primary">
                  Create First Product
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead className="bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Product
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        SKU / Barcode
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Pricing
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Visibility
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-5 py-5 align-top">
                          <div className="flex gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                              {product.main_image_url ? (
                                <span className="text-xs font-medium text-neutral-500">
                                  Image
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-neutral-400">
                                  No Img
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-black">
                                {product.product_name}
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                /{product.product_slug}
                              </p>

                              <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-600">
                                {product.short_description ||
                                  "No short description added."}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-medium text-black">
                            {product.sku || "No SKU"}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Barcode: {product.barcode || "Not set"}
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-semibold text-black">
                            {formatCurrency(product.price)}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Tax: {product.tax_percentage || 0}%
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Discount: {product.discount_percentage || 0}%
                          </p>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={
                                product.is_online_visible ? "dark" : "muted"
                              }
                            >
                              {product.is_online_visible
                                ? "Online Visible"
                                : "Hidden Online"}
                            </Badge>

                            <Badge
                              variant={product.is_featured ? "outline" : "muted"}
                            >
                              {product.is_featured
                                ? "Featured"
                                : "Not Featured"}
                            </Badge>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <Badge variant={getStatusVariant(product.status)}>
                            {formatStatus(product.status)}
                          </Badge>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <p className="text-sm font-medium text-black">
                            {formatDate(product.updated_at)}
                          </p>

                          <Link
                            href={`/client/products/${product.id}`}
                            className="mt-3 inline-flex rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-black hover:text-black"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {featuredProducts.length > 0 ? (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>
                Products marked as featured for storefront highlighting.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                >
                  <Badge variant="outline">Featured</Badge>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-black">
                    {product.product_name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  );
}