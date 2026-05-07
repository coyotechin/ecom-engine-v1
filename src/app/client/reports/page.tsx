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

type OrderRow = {
  id: string;
  order_number: string;
  order_channel: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge: number;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  payment_method: string;
  payment_status: string;
  amount: number;
  paid_at: string;
};

type ProductRow = {
  id: string;
  product_name: string;
  price: number;
  status: string;
  is_online_visible: boolean;
  is_featured: boolean;
  created_at: string;
};

type InventoryRow = {
  id: string;
  available_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  low_stock_alert: number;
  products:
    | {
        product_name: string;
        price: number;
      }
    | null;
};

type RevenueShareRow = {
  id: string;
  order_id: string;
  gross_order_amount: number;
  net_revenue_amount: number;
  revenue_share_percentage: number;
  cyt_share_amount: number;
  client_share_amount: number;
  settlement_status: string;
  settlement_date: string | null;
  created_at: string;
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

function getStatusVariant(value: string) {
  if (
    value === "paid" ||
    value === "delivered" ||
    value === "active" ||
    value === "settled"
  ) {
    return "dark" as const;
  }

  if (
    value === "partial" ||
    value === "created" ||
    value === "confirmed" ||
    value === "pending"
  ) {
    return "outline" as const;
  }

  return "muted" as const;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ClientReportsPage() {
  const supabase = await createClient();

  const [
    { data: orderData, error: orderError },
    { data: paymentData },
    { data: productData },
    { data: inventoryData },
    { data: revenueShareData },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, order_channel, order_status, payment_status, payment_method, subtotal_amount, discount_amount, tax_amount, delivery_charge, total_amount, amount_paid, balance_amount, customer_name, customer_phone, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("payments")
      .select("id, payment_method, payment_status, amount, paid_at")
      .order("paid_at", { ascending: false }),

    supabase
      .from("products")
      .select(
        "id, product_name, price, status, is_online_visible, is_featured, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("inventory")
      .select(
        "id, available_stock, reserved_stock, damaged_stock, low_stock_alert, products(product_name, price)",
      )
      .order("updated_at", { ascending: false }),

    supabase
      .from("revenue_share_entries")
      .select(
        "id, order_id, gross_order_amount, net_revenue_amount, revenue_share_percentage, cyt_share_amount, client_share_amount, settlement_status, settlement_date, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const orders = (orderData || []) as OrderRow[];
  const payments = (paymentData || []) as PaymentRow[];
  const products = (productData || []) as ProductRow[];
  const inventory = (inventoryData || []) as unknown as InventoryRow[];
  const revenueShares = (revenueShareData || []) as RevenueShareRow[];

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const totalCollected = orders.reduce(
    (sum, order) => sum + Number(order.amount_paid || 0),
    0,
  );

  const totalPending = orders.reduce(
    (sum, order) => sum + Number(order.balance_amount || 0),
    0,
  );

  const totalTax = orders.reduce(
    (sum, order) => sum + Number(order.tax_amount || 0),
    0,
  );

  const totalDiscount = orders.reduce(
    (sum, order) => sum + Number(order.discount_amount || 0),
    0,
  );

  const averageOrderValue =
    orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const onlineProducts = products.filter(
    (product) => product.is_online_visible,
  );

  const totalAvailableStock = inventory.reduce(
    (sum, item) => sum + Number(item.available_stock || 0),
    0,
  );

  const lowStockItems = inventory.filter(
    (item) => item.available_stock <= item.low_stock_alert,
  );

  const estimatedInventoryValue = inventory.reduce((sum, item) => {
    const price = Number(item.products?.price || 0);
    const stock = Number(item.available_stock || 0);

    return sum + price * stock;
  }, 0);

  const cytShareTotal = revenueShares.reduce(
    (sum, entry) => sum + Number(entry.cyt_share_amount || 0),
    0,
  );

  const clientShareTotal = revenueShares.reduce(
    (sum, entry) => sum + Number(entry.client_share_amount || 0),
    0,
  );

  const pendingSettlements = revenueShares.filter(
    (entry) => entry.settlement_status === "pending",
  );

  const today = new Date().toDateString();

  const todayOrders = orders.filter(
    (order) => new Date(order.created_at).toDateString() === today,
  );

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const reportMetrics = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSales),
      helperText: "Total order value across all loaded orders.",
    },
    {
      label: "Amount Collected",
      value: formatCurrency(totalCollected),
      helperText: "Total customer payment collected.",
    },
    {
      label: "Pending Balance",
      value: formatCurrency(totalPending),
      helperText: "Unpaid or partially pending amount.",
    },
    {
      label: "CYT Share",
      value: formatCurrency(cytShareTotal),
      helperText: "CYT Nexus revenue-share amount from available entries.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Reports"
      description="View sales, collections, pending payments, inventory value, product activity, and revenue-share performance."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Reports Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This page summarizes live Supabase data from orders, payments,
              products, inventory, and revenue-share entries.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/orders" variant="primary">
              View Orders
            </Button>

            <Button href="/client/pos" variant="outline">
              Create POS Bill
            </Button>
          </div>
        </section>

        {orderError ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load report data
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {orderError.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
                <CardDescription>
                  Core sales and order performance metrics.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Total Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {orders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Average Order Value
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Today&apos;s Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {todayOrders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Today&apos;s Sales
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(todaySales)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Total Tax
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(totalTax)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Total Discount
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(totalDiscount)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest order records contributing to report totals.
                </CardDescription>
              </CardHeader>

              {orders.length === 0 ? (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                  <h2 className="text-xl font-semibold tracking-tight text-black">
                    No order data found
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                    Create a POS bill to start generating report data.
                  </p>

                  <div className="mt-6">
                    <Button href="/client/pos" variant="primary">
                      Create POS Bill
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 8).map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <Badge
                            variant={getStatusVariant(order.payment_status)}
                          >
                            {formatLabel(order.payment_status)}
                          </Badge>

                          <Link
                            href={`/client/orders/${order.id}`}
                            className="text-xs font-medium text-neutral-600 transition hover:text-black"
                          >
                            View Order
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Product and Inventory</CardTitle>
                <CardDescription>
                  Product catalogue and stock health summary.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Total Products
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {products.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Active Products
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {activeProducts.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Online Visible Products
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {onlineProducts.length}
                  </p>
                </div>

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
                    Estimated Inventory Value
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(estimatedInventoryValue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Low Stock Items
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {lowStockItems.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Revenue Share</CardTitle>
                <CardDescription>
                  CYT Nexus and client split from generated order entries.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Revenue Entries
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {revenueShares.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    CYT Nexus Share
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(cytShareTotal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Client Share
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {formatCurrency(clientShareTotal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Pending Settlements
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {pendingSettlements.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Continue business operations from reports.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-3">
                <Button href="/client/orders" variant="primary">
                  View Orders
                </Button>

                <Button href="/client/inventory" variant="outline">
                  View Inventory
                </Button>

                <Button href="/client/products" variant="secondary">
                  View Products
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}