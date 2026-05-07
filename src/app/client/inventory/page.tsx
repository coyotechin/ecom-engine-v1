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

function getStockVariant(item: InventoryRow) {
  if (item.available_stock <= 0) {
    return "dark" as const;
  }

  if (item.available_stock <= item.low_stock_alert) {
    return "outline" as const;
  }

  return "muted" as const;
}

function getStockLabel(item: InventoryRow) {
  if (item.available_stock <= 0) {
    return "Out of Stock";
  }

  if (item.available_stock <= item.low_stock_alert) {
    return "Low Stock";
  }

  return "In Stock";
}

export default async function ClientInventoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory")
    .select(
      "id, business_id, store_id, product_id, variant_id, available_stock, reserved_stock, damaged_stock, low_stock_alert, last_stock_update_at, created_at, updated_at, products(product_name, product_slug, sku, price, status, is_online_visible), stores(store_name, store_slug, status)",
    )
    .order("updated_at", { ascending: false });

  const inventory = (data || []) as unknown as InventoryRow[];

  const totalAvailableStock = inventory.reduce(
    (sum, item) => sum + item.available_stock,
    0,
  );

  const totalReservedStock = inventory.reduce(
    (sum, item) => sum + item.reserved_stock,
    0,
  );

  const totalDamagedStock = inventory.reduce(
    (sum, item) => sum + item.damaged_stock,
    0,
  );

  const lowStockItems = inventory.filter(
    (item) => item.available_stock <= item.low_stock_alert,
  );

  const inventoryMetrics = [
    {
      label: "Inventory Items",
      value: String(inventory.length),
      helperText: "Products with stock records created in Supabase.",
    },
    {
      label: "Available Stock",
      value: String(totalAvailableStock),
      helperText: "Total sellable stock available across products.",
    },
    {
      label: "Low Stock Items",
      value: String(lowStockItems.length),
      helperText: "Products at or below their low-stock alert level.",
    },
    {
      label: "Damaged Stock",
      value: String(totalDamagedStock),
      helperText: "Stock marked as damaged and not ready for sale.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Inventory Management"
      description="Track available stock, reserved stock, damaged stock, low-stock alerts, and product-wise inventory readiness."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Inventory
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Monitor product-wise stock created during product setup. Later,
              this module will support stock-in, stock-out, stock adjustment,
              damaged stock, returns, POS sale deduction, and online order
              deduction.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/products/create" variant="outline">
              Create Product
            </Button>

            <Button href="/client/products" variant="primary">
              View Products
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load inventory
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {inventoryMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>
                Live inventory records connected to products. Opening stock is
                created automatically when a product is added.
              </CardDescription>
            </CardHeader>

            {inventory.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No inventory records found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Create a product first. The product creation workflow will
                  automatically create an inventory record with opening stock.
                </p>

                <div className="mt-6">
                  <Button href="/client/products/create" variant="primary">
                    Create Product
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
                          Store
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Stock
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Reserved / Damaged
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Product Price
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Last Update
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {inventory.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {item.products?.product_name || "Product missing"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              SKU: {item.products?.sku || "No SKU"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              /{item.products?.product_slug || "no-slug"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge
                                variant={
                                  item.products?.status === "active"
                                    ? "dark"
                                    : "muted"
                                }
                              >
                                {item.products?.status || "unknown"}
                              </Badge>

                              <Badge
                                variant={
                                  item.products?.is_online_visible
                                    ? "outline"
                                    : "muted"
                                }
                              >
                                {item.products?.is_online_visible
                                  ? "Online"
                                  : "Hidden"}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {item.stores?.store_name || "No store linked"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {item.stores?.store_slug
                                ? `/store/${item.stores.store_slug}`
                                : "No store URL"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-2xl font-semibold tracking-[-0.04em] text-black">
                              {item.available_stock}
                            </p>

                            <div className="mt-2">
                              <Badge variant={getStockVariant(item)}>
                                {getStockLabel(item)}
                              </Badge>
                            </div>

                            <p className="mt-2 text-xs text-neutral-500">
                              Alert level: {item.low_stock_alert}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              Reserved: {item.reserved_stock}
                            </p>

                            <p className="mt-1 text-sm font-medium text-black">
                              Damaged: {item.damaged_stock}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(item.products?.price || 0)}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {formatDateTime(item.last_stock_update_at)}
                            </p>

                            <Link
                              href={`/client/inventory/${item.id}`}
                              className="mt-3 inline-flex rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-black hover:text-black"
                            >
                              Manage Stock
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

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Stock Summary</CardTitle>
                <CardDescription>
                  Quick overview of current inventory condition.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Available Stock
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {totalAvailableStock}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Reserved Stock
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {totalReservedStock}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Damaged Stock
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {totalDamagedStock}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                  Products that need stock attention.
                </CardDescription>
              </CardHeader>

              {lowStockItems.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No low-stock items
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Products are currently above their low-stock alert level.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {item.products?.product_name || "Product missing"}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Current stock: {item.available_stock}
                          </p>
                        </div>

                        <Badge variant={getStockVariant(item)}>
                          {getStockLabel(item)}
                        </Badge>
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