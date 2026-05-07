import { createPosOrderAction } from "@/app/client/pos/actions";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type PosPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type InventoryRow = {
  id: string;
  available_stock: number;
  low_stock_alert: number;
  products:
    | {
        product_name: string;
        sku: string | null;
        price: number;
        status: string;
        is_online_visible: boolean;
      }
    | null;
  stores:
    | {
        store_name: string;
        store_slug: string;
      }
    | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
};

const paymentMethodOptions = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "UPI",
    value: "upi",
  },
  {
    label: "Card",
    value: "card",
  },
  {
    label: "Razorpay",
    value: "razorpay",
  },
  {
    label: "COD",
    value: "cod",
  },
  {
    label: "Mixed",
    value: "mixed",
  },
  {
    label: "Bank Transfer",
    value: "bank_transfer",
  },
  {
    label: "Other",
    value: "other",
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
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPaymentStatus(value: string) {
  const labels: Record<string, string> = {
    unpaid: "Unpaid",
    paid: "Paid",
    partial: "Partial",
    failed: "Failed",
    refunded: "Refunded",
  };

  return labels[value] || value;
}

function getPaymentStatusVariant(value: string) {
  if (value === "paid") {
    return "dark" as const;
  }

  if (value === "partial") {
    return "outline" as const;
  }

  return "muted" as const;
}

export default async function ClientPosPage({ searchParams }: PosPageProps) {
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const [{ data: inventoryData, error: inventoryError }, { data: orderData }] =
    await Promise.all([
      supabase
        .from("inventory")
        .select(
          "id, available_stock, low_stock_alert, products(product_name, sku, price, status, is_online_visible), stores(store_name, store_slug)",
        )
        .order("updated_at", { ascending: false }),

      supabase
        .from("orders")
        .select(
          "id, order_number, customer_name, customer_phone, total_amount, payment_status, payment_method, created_at",
        )
        .eq("order_channel", "offline_pos")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const inventory = (inventoryData || []) as unknown as InventoryRow[];
  const recentOrders = (orderData || []) as OrderRow[];

  const sellableInventory = inventory.filter(
    (item) =>
      item.products &&
      item.products.status === "active" &&
      item.available_stock > 0,
  );

  const productOptions = sellableInventory.map((item) => ({
    label: `${item.products?.product_name || "Product"} — ${
      item.products?.sku || "No SKU"
    } — Stock: ${item.available_stock} — ${formatCurrency(
      item.products?.price || 0,
    )}`,
    value: item.id,
  }));

  const today = new Date().toDateString();

  const todayOrders = recentOrders.filter(
    (order) => new Date(order.created_at).toDateString() === today,
  );

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const paidOrders = recentOrders.filter(
    (order) => order.payment_status === "paid",
  );

  const posMetrics = [
    {
      label: "Sellable Products",
      value: String(sellableInventory.length),
      helperText: "Active products with available inventory stock.",
    },
    {
      label: "Recent POS Orders",
      value: String(recentOrders.length),
      helperText: "Latest offline POS bills created in the system.",
    },
    {
      label: "Today's Sales",
      value: formatCurrency(todaySales),
      helperText: "Sales from recent POS orders created today.",
    },
    {
      label: "Paid Orders",
      value: String(paidOrders.length),
      helperText: "Recent POS orders marked as fully paid.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="POS Billing"
      description="Create offline store bills, capture customer details, record payments, reduce stock, and create order records."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              POS Billing
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Create quick offline bills using products from inventory. This
              first POS version supports one product per bill. Multi-item cart
              billing will be added later.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/products/create" variant="outline">
              Create Product
            </Button>

            <Button href="/client/inventory" variant="secondary">
              Inventory
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
              POS billing failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        {inventoryError ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load inventory products
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {inventoryError.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {posMetrics.map((metric) => (
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
              <CardTitle>Create POS Bill</CardTitle>
              <CardDescription>
                Select one inventory product, enter customer details, and create
                a POS order. Stock will reduce automatically after billing.
              </CardDescription>
            </CardHeader>

            {sellableInventory.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No sellable products found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Create a product with active status and available stock before
                  creating a POS bill.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <Button href="/client/products/create" variant="primary">
                    Create Product
                  </Button>

                  <Button href="/client/inventory" variant="outline">
                    Check Inventory
                  </Button>
                </div>
              </div>
            ) : (
              <form action={createPosOrderAction} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Select
                    id="inventoryId"
                    name="inventoryId"
                    label="Product"
                    options={productOptions}
                    placeholder="Choose product"
                    required
                  />

                  <Input
                    id="quantity"
                    name="quantity"
                    label="Quantity"
                    placeholder="Example: 1"
                    inputMode="numeric"
                    required
                  />

                  <Input
                    id="customerName"
                    name="customerName"
                    label="Customer Name"
                    placeholder="Example: Mr. Customer"
                    required
                  />

                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    label="Customer Phone"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />

                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    label="Customer Email"
                    placeholder="Optional"
                  />

                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    label="Amount Paid"
                    placeholder="Example: 999"
                    inputMode="decimal"
                    helperText="Payment status is calculated from amount paid."
                  />

                  <Select
                    id="paymentMethod"
                    name="paymentMethod"
                    label="Payment Method"
                    options={paymentMethodOptions}
                    defaultValue="cash"
                    required
                  />

                  <Input
                    id="transactionReference"
                    name="transactionReference"
                    label="Transaction Reference"
                    placeholder="UPI/card/reference ID if available"
                  />

                  <Input
                    id="manualDiscountAmount"
                    name="manualDiscountAmount"
                    label="Manual Discount Amount"
                    placeholder="Example: 100"
                    inputMode="decimal"
                  />

                  <Input
                    id="deliveryCharge"
                    name="deliveryCharge"
                    label="Delivery Charge"
                    placeholder="Example: 50"
                    inputMode="decimal"
                  />

                  <Textarea
                    id="customerAddress"
                    name="customerAddress"
                    label="Customer Address"
                    placeholder="Billing or delivery address"
                  />

                  <Textarea
                    id="internalNotes"
                    name="internalNotes"
                    label="Internal Notes"
                    placeholder="Any billing, payment, or delivery note."
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-black">
                      Create POS order
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Order, payment, inventory deduction, and revenue-share
                      entry will be saved to Supabase.
                    </p>
                  </div>

                  <Button type="submit" variant="primary">
                    Create Bill
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Recent POS Orders</CardTitle>
                <CardDescription>
                  Latest offline POS bills from Supabase.
                </CardDescription>
              </CardHeader>

              {recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No POS orders yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Create your first POS bill to see recent order activity.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {order.customer_name || "No customer"} ·{" "}
                            {order.customer_phone || "No phone"}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-black">
                            {formatCurrency(order.total_amount)}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {formatDateTime(order.created_at)}
                          </p>
                        </div>

                        <Badge
                          variant={getPaymentStatusVariant(
                            order.payment_status,
                          )}
                        >
                          {formatPaymentStatus(order.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>POS Notes</CardTitle>
                <CardDescription>
                  Current v.1 billing behavior.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {[
                  "Supports one product per bill in this version.",
                  "Stock reduces automatically after bill creation.",
                  "Customer records are created or updated by phone number.",
                  "Revenue-share entry is created if rule exists.",
                  "Order Management page will be built next.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-neutral-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}