import { notFound } from "next/navigation";
import { updateOrderAction } from "@/app/client/orders/[orderId]/actions";
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

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

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
  delivery_notes: string | null;
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

type OrderItemRow = {
  id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  line_total: number;
};

type PaymentRow = {
  id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  transaction_reference: string | null;
  gateway_name: string | null;
  notes: string | null;
  paid_at: string;
};

type RevenueShareRow = {
  id: string;
  gross_order_amount: number;
  net_revenue_amount: number;
  revenue_share_percentage: number;
  cyt_share_amount: number;
  client_share_amount: number;
  settlement_status: string;
  settlement_date: string | null;
};

const orderStatusOptions = [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Created",
    value: "created",
  },
  {
    label: "Confirmed",
    value: "confirmed",
  },
  {
    label: "Packed",
    value: "packed",
  },
  {
    label: "Dispatched",
    value: "dispatched",
  },
  {
    label: "Delivered",
    value: "delivered",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
  {
    label: "Returned",
    value: "returned",
  },
];

const paymentStatusOptions = [
  {
    label: "Unpaid",
    value: "unpaid",
  },
  {
    label: "Paid",
    value: "paid",
  },
  {
    label: "Partial",
    value: "partial",
  },
  {
    label: "Failed",
    value: "failed",
  },
  {
    label: "Refunded",
    value: "refunded",
  },
];

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

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const [
    { data: orderData, error: orderError },
    { data: itemData },
    { data: paymentData },
    { data: revenueData },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, business_id, store_id, customer_id, order_number, order_channel, order_status, payment_status, payment_method, subtotal_amount, discount_amount, tax_amount, delivery_charge, total_amount, amount_paid, balance_amount, customer_name, customer_phone, customer_email, billing_address, delivery_address, delivery_notes, internal_notes, invoice_number, created_at, updated_at, stores(store_name, store_slug)",
      )
      .eq("id", orderId)
      .single(),

    supabase
      .from("order_items")
      .select(
        "id, product_name, sku, quantity, unit_price, discount_percentage, discount_amount, tax_percentage, tax_amount, line_total",
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),

    supabase
      .from("payments")
      .select(
        "id, payment_method, payment_status, amount, transaction_reference, gateway_name, notes, paid_at",
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),

    supabase
      .from("revenue_share_entries")
      .select(
        "id, gross_order_amount, net_revenue_amount, revenue_share_percentage, cyt_share_amount, client_share_amount, settlement_status, settlement_date",
      )
      .eq("order_id", orderId)
      .maybeSingle(),
  ]);

  if (orderError || !orderData) {
    notFound();
  }

  const order = orderData as unknown as OrderRow;
  const items = (itemData || []) as OrderItemRow[];
  const payments = (paymentData || []) as PaymentRow[];
  const revenueShare = revenueData as RevenueShareRow | null;

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Order Detail"
      description="View order details, products sold, customer information, payment records, and revenue-share calculation."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="dark">{order.order_number}</Badge>
              <Badge variant={getOrderStatusVariant(order.order_status)}>
                {formatOrderStatus(order.order_status)}
              </Badge>
              <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                {formatPaymentStatus(order.payment_status)}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {formatCurrency(order.total_amount)}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              {formatOrderChannel(order.order_channel)} ·{" "}
              {formatPaymentMethod(order.payment_method)} · Created{" "}
              {formatDateTime(order.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/orders" variant="outline">
              Back to Orders
            </Button>

            <Button href="/client/pos" variant="secondary">
              Create POS Bill
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
              Order update failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>
                  Customer information captured during POS billing.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Customer Name" value={order.customer_name} />
                <DetailItem label="Phone" value={order.customer_phone} />
                <DetailItem label="Email" value={order.customer_email} />
                <DetailItem label="Billing Address" value={order.billing_address} />
                <DetailItem
                  label="Delivery Address"
                  value={order.delivery_address}
                />
                <DetailItem label="Delivery Notes" value={order.delivery_notes} />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Products sold in this order.
                </CardDescription>
              </CardHeader>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No order items found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    This order has no linked product item records.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-neutral-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead className="bg-neutral-50">
                        <tr className="border-b border-neutral-200">
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Product
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Qty
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Unit
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Tax
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-5 py-5 align-top">
                              <p className="text-sm font-semibold text-black">
                                {item.product_name}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                SKU: {item.sku || "No SKU"}
                              </p>
                            </td>

                            <td className="px-5 py-5 align-top text-sm font-medium text-black">
                              {item.quantity}
                            </td>

                            <td className="px-5 py-5 align-top text-sm font-medium text-black">
                              {formatCurrency(item.unit_price)}
                            </td>

                            <td className="px-5 py-5 align-top">
                              <p className="text-sm font-medium text-black">
                                {item.tax_percentage}%
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {formatCurrency(item.tax_amount)}
                              </p>
                            </td>

                            <td className="px-5 py-5 align-top text-sm font-semibold text-black">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  Payments collected against this order.
                </CardDescription>
              </CardHeader>

              {payments.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No payment records found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Add additional payment from the update form if payment is
                    collected later.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge
                            variant={getPaymentStatusVariant(
                              payment.payment_status,
                            )}
                          >
                            {formatPaymentStatus(payment.payment_status)}
                          </Badge>

                          <p className="mt-3 text-lg font-semibold text-black">
                            {formatCurrency(payment.amount)}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Method: {formatPaymentMethod(payment.payment_method)}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            Ref: {payment.transaction_reference || "Not provided"}
                          </p>

                          {payment.notes ? (
                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                              {payment.notes}
                            </p>
                          ) : null}
                        </div>

                        <p className="text-xs text-neutral-500">
                          {formatDateTime(payment.paid_at)}
                        </p>
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
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Billing, payment, and balance details.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem
                  label="Subtotal"
                  value={formatCurrency(order.subtotal_amount)}
                />
                <DetailItem
                  label="Discount"
                  value={formatCurrency(order.discount_amount)}
                />
                <DetailItem
                  label="Tax"
                  value={formatCurrency(order.tax_amount)}
                />
                <DetailItem
                  label="Delivery Charge"
                  value={formatCurrency(order.delivery_charge)}
                />
                <DetailItem
                  label="Total Amount"
                  value={formatCurrency(order.total_amount)}
                />
                <DetailItem
                  label="Amount Paid"
                  value={formatCurrency(order.amount_paid)}
                />
                <DetailItem
                  label="Balance Amount"
                  value={formatCurrency(order.balance_amount)}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Revenue Share</CardTitle>
                <CardDescription>
                  CYT Nexus revenue-share calculation for this order.
                </CardDescription>
              </CardHeader>

              {revenueShare ? (
                <div className="space-y-4">
                  <DetailItem
                    label="Revenue Share %"
                    value={`${revenueShare.revenue_share_percentage}%`}
                  />
                  <DetailItem
                    label="CYT Share"
                    value={formatCurrency(revenueShare.cyt_share_amount)}
                  />
                  <DetailItem
                    label="Client Share"
                    value={formatCurrency(revenueShare.client_share_amount)}
                  />
                  <DetailItem
                    label="Settlement Status"
                    value={revenueShare.settlement_status}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No revenue-share record found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    This may happen if the business does not have an active
                    revenue-share rule.
                  </p>
                </div>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Update Order</CardTitle>
                <CardDescription>
                  Update status, payment condition, delivery notes, and record
                  additional payment.
                </CardDescription>
              </CardHeader>

              <form action={updateOrderAction} className="space-y-5">
                <input type="hidden" name="orderId" value={order.id} />

                <Select
                  id="orderStatus"
                  name="orderStatus"
                  label="Order Status"
                  options={orderStatusOptions}
                  defaultValue={order.order_status}
                  required
                />

                <Select
                  id="paymentStatus"
                  name="paymentStatus"
                  label="Payment Status"
                  options={paymentStatusOptions}
                  defaultValue={order.payment_status}
                  required
                />

                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  label="Payment Method"
                  options={paymentMethodOptions}
                  defaultValue={order.payment_method}
                  required
                />

                <Input
                  id="additionalPayment"
                  name="additionalPayment"
                  label="Additional Payment"
                  placeholder="Example: 500"
                  inputMode="decimal"
                  helperText="Leave empty if no new payment is collected."
                />

                <Input
                  id="transactionReference"
                  name="transactionReference"
                  label="Transaction Reference"
                  placeholder="UPI/card/reference ID if payment is collected"
                />

                <Textarea
                  id="paymentNotes"
                  name="paymentNotes"
                  label="Payment Notes"
                  placeholder="Optional payment note."
                />

                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  label="Delivery Address"
                  defaultValue={order.delivery_address || ""}
                />

                <Textarea
                  id="deliveryNotes"
                  name="deliveryNotes"
                  label="Delivery Notes"
                  defaultValue={order.delivery_notes || ""}
                />

                <Textarea
                  id="internalNotes"
                  name="internalNotes"
                  label="Internal Notes"
                  defaultValue={order.internal_notes || ""}
                />

                <div className="flex flex-wrap gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <Button type="submit" variant="primary">
                    Save Order Update
                  </Button>

                  <Button href="/client/orders" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}