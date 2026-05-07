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

type ProductDetailPageProps = {
  params: Promise<{
    storeSlug: string;
    productSlug: string;
  }>;
};

type StoreRow = {
  id: string;
  store_name: string;
  store_slug: string;
  brand_description: string | null;
  contact_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  business_address: string | null;
  delivery_areas: string | null;
  payment_methods: string | null;
  return_policy: string | null;
};

type ProductRow = {
  id: string;
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
  gallery_urls: unknown;
  status: string;
  is_online_visible: boolean;
  is_featured: boolean;
  categories:
    | {
        name: string;
        description: string | null;
      }
    | null;
  inventory:
    | {
        available_stock: number;
        reserved_stock: number;
        damaged_stock: number;
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

export default async function PublicProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { storeSlug, productSlug } = await params;

  const supabase = await createClient();

  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select(
      "id, store_name, store_slug, brand_description, contact_number, whatsapp_number, email, business_address, delivery_areas, payment_methods, return_policy",
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
      "id, product_name, product_slug, sku, barcode, short_description, description, price, compare_at_price, cost_price, tax_percentage, discount_percentage, main_image_url, gallery_urls, status, is_online_visible, is_featured, categories(name, description), inventory(available_stock, reserved_stock, damaged_stock, low_stock_alert)",
    )
    .eq("store_id", store.id)
    .eq("product_slug", productSlug)
    .eq("status", "active")
    .eq("is_active", true)
    .eq("is_online_visible", true)
    .single();

  if (productError || !productData) {
    notFound();
  }

  const product = productData as unknown as ProductRow;
  const inventory = getInventory(product);
  const availableStock = inventory?.available_stock || 0;
  const isAvailable = availableStock > 0;

  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(
        /[^0-9]/g,
        "",
      )}?text=${encodeURIComponent(
        `Hi, I am interested in ${product.product_name} from ${store.store_name}.`,
      )}`
    : "#";

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href={`/store/${store.store_slug}`} className="inline-flex flex-col">
            <span className="text-xs font-medium tracking-[0.24em] text-neutral-500 uppercase">
              {store.store_name}
            </span>
            <span className="mt-1 text-lg font-semibold tracking-[-0.04em] text-black">
              Product Detail
            </span>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href={`/store/${store.store_slug}`}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
            >
              Back to Store
            </Link>

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
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex aspect-square items-center justify-center rounded-[1.5rem] border border-neutral-200 bg-neutral-50">
              {product.main_image_url ? (
                <span className="text-sm font-medium text-neutral-500">
                  Product Image Added
                </span>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-black">
                    {product.product_name}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Product image placeholder
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
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

            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-black sm:text-6xl">
              {product.product_name}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600">
              {product.short_description ||
                product.description ||
                "Product details will be updated soon."}
            </p>

            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-4xl font-semibold tracking-[-0.05em] text-black">
                {formatCurrency(product.price)}
              </p>

              {product.compare_at_price ? (
                <p className="mt-2 text-base text-neutral-500 line-through">
                  {formatCurrency(product.compare_at_price)}
                </p>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                    Available Stock
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {availableStock}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                    SKU
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {product.sku || "Not available"}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                    Tax
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {product.tax_percentage || 0}%
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                    Discount
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {product.discount_percentage || 0}%
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={whatsappHref} variant={isAvailable ? "primary" : "secondary"}>
                  {isAvailable ? "Enquire on WhatsApp" : "Out of Stock"}
                </Button>

                <Button href={`/store/${store.store_slug}`} variant="outline">
                  Back to Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[1fr_0.8fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
              <CardDescription>
                Detailed product information from the store catalogue.
              </CardDescription>
            </CardHeader>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm leading-7 text-neutral-700">
                {product.description ||
                  product.short_description ||
                  "Full product description has not been added yet."}
              </p>
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Contact, delivery, payment, and policy information.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Store
                </p>
                <p className="mt-2 text-sm font-semibold text-black">
                  {store.store_name}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Contact
                </p>
                <p className="mt-2 text-sm font-semibold text-black">
                  {store.contact_number || "Not provided"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {store.email || "Email not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Delivery Areas
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {store.delivery_areas || "Contact store for delivery details."}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Payment Methods
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {store.payment_methods || "Contact store for payment options."}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Return Policy
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {store.return_policy || "Return policy will be updated soon."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-black">
              Powered by CYT Nexus — Ecom Engine v.1
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Ready to Onboard. Ready to Sell. Built for Revenue Sharing.
            </p>
          </div>

          <Link
            href={`/store/${store.store_slug}`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
          >
            Back to Store
          </Link>
        </div>
      </section>
    </main>
  );
}