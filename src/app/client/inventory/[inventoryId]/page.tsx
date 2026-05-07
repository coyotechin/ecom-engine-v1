import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInventoryStockAction } from "@/app/client/inventory/[inventoryId]/actions";
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

type ManageStockPageProps = {
  params: Promise<{
    inventoryId: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type ProductStatus = "draft" | "active" | "inactive" | "archived";

type InventoryRow = {
  id: string;
  business_id: string;
  store_id: string | null;
  product_id: string;
  variant_id: string | null;
  available_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  low_stock_alert: number;
  last_stock_update_at: string | null;
  created_at: string;
  updated_at: string;
  products:
    | {
        product_name: string;
        product_slug: string;
        sku: string | null;
        price: number;
        status: ProductStatus;
        is_online_visible: boolean;
      }
    | null;
  stores:
    | {
        store_name: string;
        store_slug: string;
        status: string;
      }
    | null;
};

type InventoryLogRow = {
  id: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes: string | null;
  created_at: string;
};

const movementOptions = [
  {
    label: "Stock In",
    value: "stock_in",
  },
  {
    label: "Stock Out",
    value: "stock_out",
  },
  {
    label: "Adjustment",
    value: "adjustment",
  },
  {
    label: "Damaged Stock",
    value: "damaged",
  },
  {
    label: "Return Stock",
    value: "return",
  },
  {
    label: "POS Sale",
    value: "pos_sale",
  },
  {
    label: "Online Order",
    value: "online_order",
  },
];

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not updated";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMovement(value: string) {
  const labels: Record<string, string> = {
    stock_in: "Stock In",
    stock_out: "Stock Out",
    adjustment: "Adjustment",
    damaged: "Damaged Stock",
    return: "Return Stock",
    pos_sale: "POS Sale",
    online_order: "Online Order",
  };

  return labels[value] || value;
}

function getStockVariant(inventory: InventoryRow) {
  if (inventory.available_stock <= 0) {
    return "dark" as const;
  }

  if (inventory.available_stock <= inventory.low_stock_alert) {
    return "outline" as const;
  }

  return "muted" as const;
}

function getStockLabel(inventory: InventoryRow) {
  if (inventory.available_stock <= 0) {
    return "Out of Stock";
  }

  if (inventory.available_stock <= inventory.low_stock_alert) {
    return "Low Stock";
  }

  return "In Stock";
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
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

export default async function ManageStockPage({
  params,
  searchParams,
}: ManageStockPageProps) {
  const { inventoryId } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const [{ data: inventoryData, error: inventoryError }, { data: logData }] =
    await Promise.all([
      supabase
        .from("inventory")
        .select(
          "id, business_id, store_id, product_id, variant_id, available_stock, reserved_stock, damaged_stock, low_stock_alert, last_stock_update_at, created_at, updated_at, products(product_name, product_slug, sku, price, status, is_online_visible), stores(store_name, store_slug, status)",
        )
        .eq("id", inventoryId)
        .single(),

      supabase
        .from("inventory_logs")
        .select(
          "id, movement_type, quantity, previous_stock, new_stock, notes, created_at",
        )
        .eq("reference_id", inventoryId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (inventoryError || !inventoryData) {
    notFound();
  }

  const inventory = inventoryData as unknown as InventoryRow;
  const logs = (logData || []) as InventoryLogRow[];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Manage Stock"
      description="Update available stock, track stock movement, and record inventory activity for this product."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStockVariant(inventory)}>
                {getStockLabel(inventory)}
              </Badge>

              <Badge variant="outline">
                {inventory.products?.status || "unknown"}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {inventory.products?.product_name || "Product missing"}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              SKU: {inventory.products?.sku || "No SKU"} · Store:{" "}
              {inventory.stores?.store_name || "No store linked"} · Price:{" "}
              {formatCurrency(inventory.products?.price || 0)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/inventory" variant="outline">
              Back to Inventory
            </Button>

            <Button href="/client/products" variant="secondary">
              View Products
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
              Inventory update failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1fr]">
          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Current Stock</CardTitle>
                <CardDescription>
                  Live stock status from Supabase inventory table.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4">
                <DetailItem
                  label="Available Stock"
                  value={inventory.available_stock}
                />
                <DetailItem
                  label="Reserved Stock"
                  value={inventory.reserved_stock}
                />
                <DetailItem
                  label="Damaged Stock"
                  value={inventory.damaged_stock}
                />
                <DetailItem
                  label="Low Stock Alert"
                  value={inventory.low_stock_alert}
                />
                <DetailItem
                  label="Last Stock Update"
                  value={formatDateTime(inventory.last_stock_update_at)}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Product Link</CardTitle>
                <CardDescription>
                  Product and storefront connection details.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4">
                <DetailItem
                  label="Product Slug"
                  value={inventory.products?.product_slug || null}
                />
                <DetailItem
                  label="Store URL"
                  value={
                    inventory.stores?.store_slug
                      ? `/store/${inventory.stores.store_slug}`
                      : null
                  }
                />

                {inventory.stores?.store_slug ? (
                  <Link
                    href={`/store/${inventory.stores.store_slug}`}
                    className="inline-flex w-fit rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
                  >
                    Preview Store
                  </Link>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Update Stock</CardTitle>
                <CardDescription>
                  Select a movement type and enter quantity. For adjustment, you
                  may enter a positive or negative number.
                </CardDescription>
              </CardHeader>

              <form action={updateInventoryStockAction} className="space-y-5">
                <input
                  type="hidden"
                  name="inventoryId"
                  value={inventory.id}
                />

                <Select
                  id="movementType"
                  name="movementType"
                  label="Movement Type"
                  options={movementOptions}
                  placeholder="Choose movement type"
                  required
                />

                <Input
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  placeholder="Example: 10"
                  inputMode="numeric"
                  helperText="Use positive quantity for stock-in/out. For adjustment, negative values are allowed."
                  required
                />

                <Textarea
                  id="notes"
                  name="notes"
                  label="Notes"
                  placeholder="Example: Stock added from supplier invoice or manual correction."
                />

                <div className="flex flex-wrap gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <Button type="submit" variant="primary">
                    Save Stock Movement
                  </Button>

                  <Button href="/client/inventory" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Recent Stock Logs</CardTitle>
                <CardDescription>
                  Last 10 stock movements for this inventory record.
                </CardDescription>
              </CardHeader>

              {logs.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No stock logs found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Stock movements will appear here after updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Badge variant="outline">
                            {formatMovement(log.movement_type)}
                          </Badge>

                          <p className="mt-3 text-sm font-semibold text-black">
                            Quantity: {log.quantity}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Previous: {log.previous_stock} → New:{" "}
                            {log.new_stock}
                          </p>

                          {log.notes ? (
                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                              {log.notes}
                            </p>
                          ) : null}
                        </div>

                        <p className="text-xs text-neutral-500">
                          {formatDateTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}