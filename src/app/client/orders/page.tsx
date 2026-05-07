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

type OrderChannel =
  | "offline_pos"
  | "online_store"
  | "manual_order"
  | "whatsapp_order";

type OrderStatus =
  | "draft"
  | "created"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "returned";

type PaymentStatus = "unpaid" | "paid" | "partial" | "failed" | "refunded";

type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "razorpay"
  | "cod"
  | "mixed"
  | "bank_transfer"
  | "other";

type OrderRow = {
  id: string;
  business_id: string;
  store_id: string | null;
  customer_id: string | null;
  order_number: string;
  order_channel: OrderChannel;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge: number;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  billing_address: string | null;
  delivery_address: string | null;
  internal_notes: string | null;
  invoice_number: string | null;
  created_at: string;
  updated_at: string;
  stores:
    | {
        store_name: string;
        store_slug: string;
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

function formatOrderChannel(value: OrderChannel) {
  const labels: Record<OrderChannel, string> = {
    offline_pos: "Offline POS",
    online_store: "Online Store",
    manual_order: "Manual Order",
    whatsapp_order: "WhatsApp Order",
  };

  return labels[value];
}

function formatOrderStatus(value: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    draft: "Draft",
    created: "Created",
    confirmed: "Confirmed",
    packed: "Packed",
    dispatched: "Dispatched",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  return labels[value];
}

function formatPaymentStatus(value: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    unpaid: "Unpaid",
    paid: "Paid",
    partial: "Partial",
    failed: "Failed",
    refunded: "Refunded",
  };

  return labels[value];
}

function formatPaymentMethod(value: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    razorpay: "Razorpay",
    cod: "COD",
    mixed: "Mixed",
    bank_transfer: "Bank Transfer",
    other: "Other",
  };

  return labels[value];
}

function getOrderStatusVariant(value: OrderStatus) {
  if (value === "delivered" || value === "confirmed") {
    return "dark" as const;
  }

  if (value === "created" || value === "packed" || value === "dispatched") {
    return "outline" as const;
  }

  return "muted" as const;
}

function getPaymentStatusVariant(value: PaymentStatus) {
  if (value === "paid") {
    return "dark" as const;
  }

  if (value === "partial") {
    return "outline" as const;
  }

  return "muted" as const;
}

export default async function ClientOrdersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, business_id, store_id, customer_id, order_number, order_channel, order_status, payment_status, payment_method, subtotal_amount, discount_amount, tax_amount, delivery_charge, total_amount, amount_paid, balance_amount, customer_name, customer_phone, customer_email, billing_address, delivery_address, internal_notes, invoice_number, created_at, updated_at, stores(store_name, store_slug)",
    )
    .order("created_at", { ascending: false });

  const orders = (data || []) as unknown as OrderRow[];

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const totalPaid = orders.reduce(
    (sum, order) => sum + Number(order.amount_paid || 0),
    0,
  );

  const totalBalance = orders.reduce(
    (sum, order) => sum + Number(order.balance_amount || 0),
    0,
  );

  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter(
    (order) =>
      order.payment_status === "unpaid" || order.payment_status === "partial",
  );

  const today = new Date().toDateString();

  const todayOrders = orders.filter(
    (order) => new Date(order.created_at).toDateString() === today,
  );

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const orderMetrics = [
    {
      label: "Total Orders",
      value: String(orders.length),
      helperText: "All orders and POS bills saved in Supabase.",
    },
    {
      label: "Total Sales",
      value: formatCurrency(totalSales),
      helperText: "Total order value across all loaded orders.",
    },
    {
      label: "Amount Collected",
      value: formatCurrency(totalPaid),
      helperText: "Total paid amount collected from customers.",
    },
    {
      label: "Pending Balance",
      value: formatCurrency(totalBalance),
      helperText: "Amount still unpaid or partially pending.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Order Management"
      description="Track POS bills, online orders, payment status, customer details, order status, sales totals, and pending balances."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Orders
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              View all sales records created through POS, online store, manual
              order, or WhatsApp order channels. This page currently displays
              live Supabase order data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/pos" variant="primary">
              Create POS Bill
            </Button>

            <Button href="/client/inventory" variant="outline">
              Inventory
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load orders
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {orderMetrics.map((metric) => (
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
              <CardTitle>Order List</CardTitle>
              <CardDescription>
                Live order records from Supabase. POS bills created from
                /client/pos will appear here.
              </CardDescription>
            </CardHeader>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No orders found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Create your first POS bill to start generating order records,
                  payment records, inventory logs, and revenue-share entries.
                </p>

                <div className="mt-6">
                  <Button href="/client/pos" variant="primary">
                    Create POS Bill
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-left">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Order
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Customer
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Store
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Amount
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Payment
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Status
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Created
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {order.order_number}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Invoice: {order.invoice_number || "Not set"}
                            </p>

                            <div className="mt-3">
                              <Badge variant="outline">
                                {formatOrderChannel(order.order_channel)}
                              </Badge>
                            </div>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {order.customer_name || "No customer"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {order.customer_phone || "No phone"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {order.customer_email || "No email"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {order.stores?.store_name || "No store linked"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {order.stores?.store_slug
                                ? `/store/${order.stores.store_slug}`
                                : "No store URL"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(order.total_amount)}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Paid: {formatCurrency(order.amount_paid)}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Balance: {formatCurrency(order.balance_amount)}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <div className="flex flex-col gap-2">
                              <Badge
                                variant={getPaymentStatusVariant(
                                  order.payment_status,
                                )}
                              >
                                {formatPaymentStatus(order.payment_status)}
                              </Badge>

                              <span className="text-xs font-medium text-neutral-500">
                                {formatPaymentMethod(order.payment_method)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <Badge
                              variant={getOrderStatusVariant(
                                order.order_status,
                              )}
                            >
                              {formatOrderStatus(order.order_status)}
                            </Badge>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {formatDateTime(order.created_at)}
                            </p>

                            <Link
                              href={`/client/orders/${order.id}`}
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

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Today&apos;s Orders</CardTitle>
                <CardDescription>
                  Quick sales summary for orders created today.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Today&apos;s Order Count
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
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>
                  Quick view of payment health across recent orders.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Paid Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {paidOrders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Pending / Partial Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {pendingOrders.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
                <CardDescription>
                  Current v.1 order management behavior.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {[
                  "POS bills are saved as offline POS orders.",
                  "Payment status is calculated from amount paid.",
                  "Inventory is reduced during POS billing.",
                  "Revenue-share entries are generated during billing.",
                  "Order detail and status update pages will be built next.",
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