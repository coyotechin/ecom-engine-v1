import Link from "next/link";
import { notFound } from "next/navigation";
import { createCheckoutRequestAction } from "@/app/store/[storeSlug]/products/[productSlug]/checkout/actions";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CheckoutPageProps = {
  params: Promise<{
    storeSlug: string;
    productSlug: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type StoreRow = {
  id: string;
  business_id: string;
  store_name: string;
  store_slug: string;
  contact_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  delivery_areas: string | null;
  payment_methods: string | null;
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

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { storeSlug, productSlug } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select(
      "id, business_id, store_name, store_slug, contact_number, whatsapp_number, email, delivery_areas, payment_methods",
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
      "id, product_name, product_slug, sku, short_description, description, price, compare_at_price, tax_percentage, discount_percentage, main_image_url, inventory(available_stock, low_stock_alert)",
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

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link href={`/store/${store.store_slug}`} className="inline-flex flex-col">
            <span className="text-xs font-medium tracking-[0.24em] text-neutral-500 uppercase">
              {store.store_name}
            </span>
            <span className="mt-1 text-lg font-semibold tracking-[-0.04em] text-black">
              Checkout Request
            </span>
          </Link>

          <Link
            href={`/store/${store.store_slug}/products/${product.product_slug}`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
          >
            Back to Product
          </Link>
        </div>
      </header>

      <section className="bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <Card className="shadow-none">
            <div className="flex aspect-square items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50">
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
              <div className="flex flex-wrap gap-2">
                <Badge variant={availableStock > 0 ? "dark" : "muted"}>
                  {availableStock > 0 ? "Available" : "Out of Stock"}
                </Badge>

                <Badge variant="outline">Stock: {availableStock}</Badge>
              </div>

              <CardTitle>{product.product_name}</CardTitle>

              <CardDescription>
                {product.short_description ||
                  product.description ||
                  "Product details will be updated soon."}
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Price
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  {formatCurrency(product.price)}
                </p>
                {product.compare_at_price ? (
                  <p className="mt-1 text-sm text-neutral-500 line-through">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Store Payment Methods
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {store.payment_methods || "Contact store for payment details."}
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
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <Badge variant="dark">Public Checkout</Badge>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black">
                Submit checkout request
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                This request will be sent to the store team. The store will
                confirm availability, delivery, and payment before final order
                processing.
              </p>
            </div>

            {success ? (
              <div className="rounded-3xl border border-black bg-white p-5">
                <p className="text-sm font-semibold text-black">
                  Request submitted
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {success}
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-neutral-300 bg-white p-5">
                <p className="text-sm font-semibold text-black">
                  Checkout request failed
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {error}
                </p>
              </div>
            ) : null}

            {availableStock <= 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  Product is currently out of stock
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Please contact the store through WhatsApp or check other
                  products.
                </p>

                <div className="mt-6">
                  <Button href={`/store/${store.store_slug}`} variant="primary">
                    Back to Store
                  </Button>
                </div>
              </div>
            ) : (
              <form action={createCheckoutRequestAction} className="space-y-6">
                <input type="hidden" name="storeSlug" value={store.store_slug} />
                <input
                  type="hidden"
                  name="productSlug"
                  value={product.product_slug}
                />

                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>
                      Enter customer contact details for order confirmation.
                    </CardDescription>
                  </CardHeader>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      id="customerName"
                      name="customerName"
                      label="Customer Name"
                      placeholder="Your full name"
                      required
                    />

                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      label="Phone Number"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />

                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      label="Email"
                      placeholder="Optional"
                    />

                    <Input
                      id="quantity"
                      name="quantity"
                      label="Quantity"
                      placeholder="Example: 1"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </Card>

                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Delivery Details</CardTitle>
                    <CardDescription>
                      Enter delivery location and any customer note.
                    </CardDescription>
                  </CardHeader>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      label="Delivery Address"
                      placeholder="Full delivery address"
                      required
                    />

                    <Textarea
                      id="customerNotes"
                      name="customerNotes"
                      label="Customer Notes"
                      placeholder="Any size, color, delivery, or timing note."
                    />

                    <Input
                      id="deliveryCity"
                      name="deliveryCity"
                      label="City"
                      placeholder="Example: Chennai"
                    />

                    <Input
                      id="deliveryPincode"
                      name="deliveryPincode"
                      label="Pincode"
                      placeholder="Example: 600001"
                    />

                    <Input
                      id="preferredPaymentMethod"
                      name="preferredPaymentMethod"
                      label="Preferred Payment Method"
                      placeholder="Example: UPI / Cash / Card"
                    />

                    <Input
                      id="preferredDeliveryTime"
                      name="preferredDeliveryTime"
                      label="Preferred Delivery Time"
                      placeholder="Example: Tomorrow evening"
                    />
                  </div>
                </Card>

                <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-black">
                      Submit request
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      This does not confirm payment. Store team will review and
                      confirm your order.
                    </p>
                  </div>

                  <Button type="submit" variant="primary">
                    Submit Checkout Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}