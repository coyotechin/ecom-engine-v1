import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StorePageProps = {
  params: Promise<{
    storeSlug: string;
  }>;
};

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
  status: string;
};

type ProductRow = {
  id: string;
  product_name: string;
  product_slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  tax_percentage: number;
  discount_percentage: number;
  main_image_url: string | null;
  status: string;
  is_online_visible: boolean;
  is_featured: boolean;
  categories:
    | {
        name: string;
      }
    | null;
  inventory:
    | {
        available_stock: number;
        low_stock_alert: number;
      }[]
    | null;
};

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getInventory(product: ProductRow) {
  return product.inventory?.[0] || null;
}

function getStockLabel(product: ProductRow) {
  const inventory = getInventory(product);

  if (!inventory) {
    return "Stock not available";
  }

  if (inventory.available_stock <= 0) {
    return "Out of Stock";
  }

  if (inventory.available_stock <= inventory.low_stock_alert) {
    return "Low Stock";
  }

  return "In Stock";
}

function getStockVariant(product: ProductRow) {
  const inventory = getInventory(product);

  if (!inventory || inventory.available_stock <= 0) {
    return "muted" as const;
  }

  if (inventory.available_stock <= inventory.low_stock_alert) {
    return "outline" as const;
  }

  return "dark" as const;
}

export default async function PublicStorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;

  const supabase = await createClient();

  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select(
      "id, business_id, store_name, store_slug, store_logo_url, store_banner_url, brand_description, contact_number, whatsapp_number, email, business_address, delivery_areas, payment_methods, return_policy, privacy_policy, terms_and_conditions, status",
    )
    .eq("store_slug", storeSlug)
    .eq("status", "live")
    .eq("is_active", true)
    .single();

  if (storeError || !storeData) {
    notFound();
  }

  const store = storeData as StoreRow;

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id, product_name, product_slug, sku, short_description, description, price, compare_at_price, tax_percentage, discount_percentage, main_image_url, status, is_online_visible, is_featured, categories(name), inventory(available_stock, low_stock_alert)",
    )
    .eq("store_id", store.id)
    .eq("status", "active")
    .eq("is_active", true)
    .eq("is_online_visible", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const products = (productData || []) as unknown as ProductRow[];
  const featuredProducts = products.filter((product) => product.is_featured);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="inline-flex flex-col">
            <span className="text-xs font-medium tracking-[0.24em] text-neutral-500 uppercase">
              Powered by CYT Nexus
            </span>
            <span className="mt-1 text-lg font-semibold tracking-[-0.04em] text-black">
              Ecom Engine v.1
            </span>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            {store.whatsapp_number ? (
              <Link
                href={`https://wa.me/${store.whatsapp_number.replace(
                  /[^0-9]/g,
                  "",
                )}`}
                target="_blank"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
              >
                WhatsApp
              </Link>
            ) : null}

            {store.contact_number ? (
              <a
                href={`tel:${store.contact_number}`}
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Call Store
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <Badge variant="dark">Live Store</Badge>

            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-black sm:text-6xl">
              {store.store_name}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
              {store.brand_description ||
                "Welcome to our online store. Explore products, check availability, and contact the store for order support."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#products" variant="primary">
                View Products
              </Button>

              {store.whatsapp_number ? (
                <Button
                  href={`https://wa.me/${store.whatsapp_number.replace(
                    /[^0-9]/g,
                    "",
                  )}`}
                  variant="outline"
                >
                  Message Store
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-neutral-200 bg-neutral-50">
              {store.store_banner_url ? (
                <span className="text-sm font-medium text-neutral-500">
                  Store Banner Added
                </span>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-black">
                    {store.store_name}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Storefront image placeholder
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Products
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              {products.length}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Online visible products.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Featured
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              {featuredProducts.length}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Highlighted store products.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Delivery
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-black">
              {store.delivery_areas || "Contact store"}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Payments
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-black">
              {store.payment_methods || "Contact store"}
            </p>
          </div>
        </div>
      </section>

      <section id="products" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="outline">Customer Storefront</Badge>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
                Products
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                Browse products currently available from this store. Checkout
                flow will be connected in the next customer storefront phase.
              </p>
            </div>

            <Button href="/" variant="outline">
              Back to Ecom Engine
            </Button>
          </div>

          {productError ? (
            <div className="mt-8 rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-black">
                Could not load products
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {productError.message}
              </p>
            </div>
          ) : null}

          {products.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                No products available yet
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Products will appear here after the store owner marks products
                as active and online visible.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const inventory = getInventory(product);
                const availableStock = inventory?.available_stock || 0;
                const isAvailable = availableStock > 0;

                return (
                  <Card key={product.id} className="shadow-none">
                    <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50">
                      {product.main_image_url ? (
                        <span className="text-sm font-medium text-neutral-500">
                          Product Image Added
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-neutral-400">
                          No Image
                        </span>
                      )}
                    </div>

                    <CardHeader>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant={getStockVariant(product)}>
                          {getStockLabel(product)}
                        </Badge>

                        {product.is_featured ? (
                          <Badge variant="outline">Featured</Badge>
                        ) : null}

                        {product.categories?.name ? (
                          <Badge variant="muted">{product.categories.name}</Badge>
                        ) : null}
                      </div>

                      <CardTitle>{product.product_name}</CardTitle>

                      <CardDescription>
                        {product.short_description ||
                          product.description ||
                          "Product details will be updated soon."}
                      </CardDescription>
                    </CardHeader>

                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.04em] text-black">
                          {formatCurrency(product.price)}
                        </p>

                        {product.compare_at_price ? (
                          <p className="mt-1 text-sm text-neutral-500 line-through">
                            {formatCurrency(product.compare_at_price)}
                          </p>
                        ) : null}

                        <p className="mt-2 text-xs text-neutral-500">
                          SKU: {product.sku || "Not available"}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Available stock: {availableStock}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          href={`/store/${store.store_slug}/products/${product.product_slug}`}
                          variant="outline"
                        >
                          View Details
                        </Button>

                        <Button
                          href={
                            store.whatsapp_number
                              ? `https://wa.me/${store.whatsapp_number.replace(
                                  /[^0-9]/g,
                                  "",
                                )}?text=${encodeURIComponent(
                                  `Hi, I am interested in ${product.product_name}`,
                                )}`
                              : "#"
                          }
                          variant={isAvailable ? "primary" : "secondary"}
                        >
                          {isAvailable ? "Enquire Now" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Contact
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              {store.contact_number || "Contact number not added"}
            </p>
            <p className="mt-1 text-sm leading-6 text-neutral-700">
              {store.email || "Email not added"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Address
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              {store.business_address || "Address not added"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Store Policies
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              {store.return_policy || "Return policy will be updated soon."}
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-6 py-5">
          <p className="text-center text-xs text-neutral-500">
            Powered by CYT Nexus — Ecom Engine v.1
          </p>
        </div>
      </section>
    </main>
  );
}