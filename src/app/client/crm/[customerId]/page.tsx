import { notFound } from "next/navigation";
import { updateCustomerAction } from "@/app/client/crm/[customerId]/actions";
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

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type CustomerRow = {
  id: string;
  business_id: string;
  store_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  order_channel: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  created_at: string;
};

const activeOptions = [
  {
    label: "Active",
    value: "true",
  },
  {
    label: "Inactive",
    value: "false",
  },
];

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

function formatOrderStatus(value: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    created: "Created",
    confirmed: "Confirmed",
    packed: "Packed",
    dispatched: "Dispatched",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  return labels[value] || value;
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

function getCustomerVariant(customer: CustomerRow) {
  if (!customer.is_active) {
    return "muted" as const;
  }

  if (customer.total_orders >= 5) {
    return "dark" as const;
  }

  if (customer.total_orders >= 2) {
    return "outline" as const;
  }

  return "muted" as const;
}

function getCustomerLabel(customer: CustomerRow) {
  if (!customer.is_active) {
    return "Inactive";
  }

  if (customer.total_orders >= 5) {
    return "Loyal Customer";
  }

  if (customer.total_orders >= 2) {
    return "Repeat Customer";
  }

  return "New Customer";
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

export default async function CustomerDetailPage({
  params,
  searchParams,
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const [
    { data: customerData, error: customerError },
    { data: orderData },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select(
        "id, business_id, store_id, customer_name, phone, email, address, city, state, pincode, notes, total_orders, total_spent, last_order_at, is_active, created_at, updated_at, stores(store_name, store_slug)",
      )
      .eq("id", customerId)
      .single(),

    supabase
      .from("orders")
      .select(
        "id, order_number, order_channel, order_status, payment_status, payment_method, total_amount, amount_paid, balance_amount, created_at",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (customerError || !customerData) {
    notFound();
  }

  const customer = customerData as unknown as CustomerRow;
  const orders = (orderData || []) as OrderRow[];

  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter(
    (order) =>
      order.payment_status === "unpaid" || order.payment_status === "partial",
  );

  const customerMetrics = [
    {
      label: "Total Orders",
      value: String(customer.total_orders),
      helperText: "Total number of orders recorded for this customer.",
    },
    {
      label: "Total Spent",
      value: formatCurrency(customer.total_spent),
      helperText: "Total revenue generated from this customer.",
    },
    {
      label: "Paid Orders",
      value: String(paidOrders.length),
      helperText: "Orders fully paid by this customer.",
    },
    {
      label: "Pending Orders",
      value: String(pendingOrders.length),
      helperText: "Orders unpaid or partially paid.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Customer Detail"
      description="View customer profile, order history, contact information, spending value, and CRM notes."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getCustomerVariant(customer)}>
                {getCustomerLabel(customer)}
              </Badge>

              <Badge variant="outline">
                Last order: {formatDate(customer.last_order_at)}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {customer.customer_name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Phone: {customer.phone} · Email:{" "}
              {customer.email || "No email"} · Store:{" "}
              {customer.stores?.store_name || "No store linked"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/crm" variant="outline">
              Back to CRM
            </Button>

            <Button href="/client/pos" variant="primary">
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
              Customer update failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {customerMetrics.map((metric) => (
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
                <CardTitle>Customer Profile</CardTitle>
                <CardDescription>
                  Contact and address details saved in CRM.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem
                  label="Customer Name"
                  value={customer.customer_name}
                />
                <DetailItem label="Phone" value={customer.phone} />
                <DetailItem label="Email" value={customer.email} />
                <DetailItem label="Address" value={customer.address} />
                <DetailItem label="City" value={customer.city} />
                <DetailItem label="State" value={customer.state} />
                <DetailItem label="Pincode" value={customer.pincode} />
                <DetailItem
                  label="Created At"
                  value={formatDateTime(customer.created_at)}
                />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>CRM Notes</CardTitle>
                <CardDescription>
                  Internal notes for follow-up, preferences, and relationship
                  management.
                </CardDescription>
              </CardHeader>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm leading-7 text-neutral-700">
                  {customer.notes || "No customer notes added yet."}
                </p>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Orders connected to this customer.
                </CardDescription>
              </CardHeader>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No orders found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Orders will appear here after POS or online checkout.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-neutral-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead className="bg-neutral-50">
                        <tr className="border-b border-neutral-200">
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Order
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Amount
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Payment
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            Date
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
                                {formatOrderStatus(order.order_status)}
                              </p>
                            </td>

                            <td className="px-5 py-5 align-top">
                              <p className="text-sm font-semibold text-black">
                                {formatCurrency(order.total_amount)}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                Paid: {formatCurrency(order.amount_paid)}
                              </p>
                            </td>

                            <td className="px-5 py-5 align-top">
                              <Badge
                                variant={getPaymentStatusVariant(
                                  order.payment_status,
                                )}
                              >
                                {formatPaymentStatus(order.payment_status)}
                              </Badge>
                            </td>

                            <td className="px-5 py-5 align-top">
                              <p className="text-sm font-medium text-black">
                                {formatDateTime(order.created_at)}
                              </p>

                              <Button
                                href={`/client/orders/${order.id}`}
                                variant="outline"
                                size="sm"
                                className="mt-3"
                              >
                                View Order
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Update Customer</CardTitle>
                <CardDescription>
                  Edit customer details and CRM notes.
                </CardDescription>
              </CardHeader>

              <form action={updateCustomerAction} className="space-y-5">
                <input type="hidden" name="customerId" value={customer.id} />

                <Input
                  id="customerName"
                  name="customerName"
                  label="Customer Name"
                  defaultValue={customer.customer_name}
                  required
                />

                <Input
                  id="phone"
                  name="phone"
                  label="Phone"
                  defaultValue={customer.phone}
                  required
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  defaultValue={customer.email || ""}
                />

                <Textarea
                  id="address"
                  name="address"
                  label="Address"
                  defaultValue={customer.address || ""}
                />

                <Input
                  id="city"
                  name="city"
                  label="City"
                  defaultValue={customer.city || ""}
                />

                <Input
                  id="state"
                  name="state"
                  label="State"
                  defaultValue={customer.state || ""}
                />

                <Input
                  id="pincode"
                  name="pincode"
                  label="Pincode"
                  defaultValue={customer.pincode || ""}
                />

                <Select
                  id="isActive"
                  name="isActive"
                  label="Customer Status"
                  options={activeOptions}
                  defaultValue={customer.is_active ? "true" : "false"}
                  required
                />

                <Textarea
                  id="notes"
                  name="notes"
                  label="CRM Notes"
                  defaultValue={customer.notes || ""}
                  placeholder="Example: Follow up next month, prefers WhatsApp updates, interested in offers."
                />

                <div className="flex flex-wrap gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <Button type="submit" variant="primary">
                    Save Customer
                  </Button>

                  <Button href="/client/crm" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Customer Summary</CardTitle>
                <CardDescription>
                  Relationship and buying behavior summary.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem
                  label="Customer Type"
                  value={getCustomerLabel(customer)}
                />
                <DetailItem
                  label="Total Orders"
                  value={customer.total_orders}
                />
                <DetailItem
                  label="Total Spent"
                  value={formatCurrency(customer.total_spent)}
                />
                <DetailItem
                  label="Last Order"
                  value={formatDate(customer.last_order_at)}
                />
                <DetailItem
                  label="Store"
                  value={customer.stores?.store_name || null}
                />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}