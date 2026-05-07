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

type CheckoutRequestStatus =
  | "pending"
  | "accepted"
  | "converted_to_order"
  | "rejected"
  | "cancelled";

type CheckoutRequestRow = {
  id: string;
  business_id: string;
  store_id: string;
  product_id: string;
  request_number: string;
  product_name: string;
  product_slug: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_pincode: string | null;
  customer_notes: string | null;
  preferred_payment_method: string | null;
  preferred_delivery_time: string | null;
  status: CheckoutRequestStatus;
  converted_order_id: string | null;
  reviewed_at: string | null;
  internal_notes: string | null;
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

function formatStatus(status: CheckoutRequestStatus) {
  const labels: Record<CheckoutRequestStatus, string> = {
    pending: "Pending",
    accepted: "Accepted",
    converted_to_order: "Converted to Order",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function getStatusVariant(status: CheckoutRequestStatus) {
  if (status === "converted_to_order" || status === "accepted") {
    return "dark" as const;
  }

  if (status === "pending") {
    return "outline" as const;
  }

  return "muted" as const;
}

export default async function ClientCheckoutRequestsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checkout_requests")
    .select(
      "id, business_id, store_id, product_id, request_number, product_name, product_slug, sku, unit_price, quantity, subtotal_amount, discount_amount, tax_amount, delivery_charge, total_amount, customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_pincode, customer_notes, preferred_payment_method, preferred_delivery_time, status, converted_order_id, reviewed_at, internal_notes, created_at, updated_at, stores(store_name, store_slug)",
    )
    .order("created_at", { ascending: false });

  const requests = (data || []) as unknown as CheckoutRequestRow[];

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );

  const acceptedRequests = requests.filter(
    (request) => request.status === "accepted",
  );

  const convertedRequests = requests.filter(
    (request) => request.status === "converted_to_order",
  );

  const totalRequestValue = requests.reduce(
    (sum, request) => sum + Number(request.total_amount || 0),
    0,
  );

  const pendingRequestValue = pendingRequests.reduce(
    (sum, request) => sum + Number(request.total_amount || 0),
    0,
  );

  const requestMetrics = [
    {
      label: "Total Requests",
      value: String(requests.length),
      helperText: "All public checkout requests submitted from storefront.",
    },
    {
      label: "Pending Requests",
      value: String(pendingRequests.length),
      helperText: "Requests waiting for client/admin review.",
    },
    {
      label: "Request Value",
      value: formatCurrency(totalRequestValue),
      helperText: "Total value of all checkout requests.",
    },
    {
      label: "Pending Value",
      value: formatCurrency(pendingRequestValue),
      helperText: "Total value of pending checkout requests.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Checkout Requests"
      description="Review public storefront checkout requests submitted by customers before accepting, rejecting, or converting them into confirmed orders."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Customer Storefront</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Checkout Requests
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              View customer checkout requests submitted from the public store.
              These are not confirmed orders yet. Review and convert them into
              orders in the next workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/orders" variant="primary">
              View Orders
            </Button>

            <Button href="/client/reports" variant="outline">
              Reports
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load checkout requests
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {requestMetrics.map((metric) => (
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
              <CardTitle>Request List</CardTitle>
              <CardDescription>
                Live checkout request records from Supabase. Requests submitted
                from public product checkout pages will appear here.
              </CardDescription>
            </CardHeader>

            {requests.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No checkout requests found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Submit a checkout request from a public product page first.
                  Pending customer requests will then appear here.
                </p>

                <div className="mt-6">
                  <Button href="/client/products" variant="primary">
                    View Products
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] border-collapse text-left">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Request
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Customer
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Product
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Store
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Amount
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
                      {requests.map((request) => (
                        <tr
                          key={request.id}
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {request.request_number}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Qty: {request.quantity}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Preferred payment:{" "}
                              {request.preferred_payment_method || "Not set"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {request.customer_name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {request.customer_phone}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {request.customer_email || "No email"}
                            </p>

                            <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                              {request.delivery_address}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {request.product_name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              SKU: {request.sku || "No SKU"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              /{request.product_slug}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {request.stores?.store_name || "No store linked"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {request.stores?.store_slug
                                ? `/store/${request.stores.store_slug}`
                                : "No store URL"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(request.total_amount)}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Unit: {formatCurrency(request.unit_price)}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Tax: {formatCurrency(request.tax_amount)}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <Badge variant={getStatusVariant(request.status)}>
                              {formatStatus(request.status)}
                            </Badge>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {formatDateTime(request.created_at)}
                            </p>

                            <Link
                              href={`/client/checkout-requests/${request.id}`}
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
                <CardTitle>Request Summary</CardTitle>
                <CardDescription>
                  Current checkout request pipeline status.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Pending
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {pendingRequests.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Accepted
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {acceptedRequests.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Converted to Order
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {convertedRequests.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Checkout Request Notes</CardTitle>
                <CardDescription>
                  Current v.1 behavior.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {[
                  "Public checkout requests are not confirmed orders yet.",
                  "Client/Admin must review customer details before processing.",
                  "Inventory is not reduced when request is submitted.",
                  "Conversion to confirmed order will be built next.",
                  "This protects the business from fake or incomplete orders.",
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

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Continue customer request and sales workflows.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-3">
                <Button href="/client/orders" variant="primary">
                  View Orders
                </Button>

                <Button href="/client/pos" variant="outline">
                  Create POS Bill
                </Button>

                <Button href="/client/reports" variant="secondary">
                  View Reports
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}