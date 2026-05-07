import Link from "next/link";
import { notFound } from "next/navigation";
import {
  convertCheckoutRequestToOrderAction,
  updateCheckoutRequestAction,
} from "@/app/client/checkout-requests/[requestId]/actions";
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

type CheckoutRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

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
  products:
    | {
        product_name: string;
        product_slug: string;
        status: string;
        is_online_visible: boolean;
      }
    | null;
};

type InventoryRow = {
  id: string;
  available_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  low_stock_alert: number;
};

const requestStatusOptions = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Accepted",
    value: "accepted",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Cancelled",
    value: "cancelled",
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

export default async function CheckoutRequestDetailPage({
  params,
  searchParams,
}: CheckoutRequestDetailPageProps) {
  const { requestId } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const [
    { data: requestData, error: requestError },
    { data: inventoryData },
  ] = await Promise.all([
    supabase
      .from("checkout_requests")
      .select(
        "id, business_id, store_id, product_id, request_number, product_name, product_slug, sku, unit_price, quantity, subtotal_amount, discount_amount, tax_amount, delivery_charge, total_amount, customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_pincode, customer_notes, preferred_payment_method, preferred_delivery_time, status, converted_order_id, reviewed_at, internal_notes, created_at, updated_at, stores(store_name, store_slug), products(product_name, product_slug, status, is_online_visible)",
      )
      .eq("id", requestId)
      .single(),

    supabase
      .from("inventory")
      .select("id, available_stock, reserved_stock, damaged_stock, low_stock_alert")
      .eq("product_id", requestId)
      .maybeSingle(),
  ]);

  if (requestError || !requestData) {
    notFound();
  }

  const request = requestData as unknown as CheckoutRequestRow;

  const { data: inventoryByProduct } = await supabase
    .from("inventory")
    .select("id, available_stock, reserved_stock, damaged_stock, low_stock_alert")
    .eq("product_id", request.product_id)
    .maybeSingle();

  const inventory = (inventoryByProduct || inventoryData) as InventoryRow | null;
  const availableStock = Number(inventory?.available_stock || 0);
  const canConvert =
    request.status !== "converted_to_order" &&
    request.status !== "rejected" &&
    request.status !== "cancelled" &&
    !request.converted_order_id;

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Checkout Request Detail"
      description="Review customer checkout request details, update request status, and convert the request into a confirmed order."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="dark">{request.request_number}</Badge>
              <Badge variant={getStatusVariant(request.status)}>
                {formatStatus(request.status)}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              {request.customer_name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Product: {request.product_name} · Quantity: {request.quantity} ·
              Request value: {formatCurrency(request.total_amount)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/checkout-requests" variant="outline">
              Back to Requests
            </Button>

            {request.converted_order_id ? (
              <Button
                href={`/client/orders/${request.converted_order_id}`}
                variant="primary"
              >
                View Converted Order
              </Button>
            ) : null}
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
              Checkout request action failed
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
                  Customer and delivery information submitted from the public
                  storefront.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Customer Name" value={request.customer_name} />
                <DetailItem label="Phone" value={request.customer_phone} />
                <DetailItem label="Email" value={request.customer_email} />
                <DetailItem label="Delivery Address" value={request.delivery_address} />
                <DetailItem label="City" value={request.delivery_city} />
                <DetailItem label="Pincode" value={request.delivery_pincode} />
                <DetailItem
                  label="Preferred Payment"
                  value={request.preferred_payment_method}
                />
                <DetailItem
                  label="Preferred Delivery Time"
                  value={request.preferred_delivery_time}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Customer Notes
                </p>
                <p className="mt-2 text-sm leading-7 text-neutral-700">
                  {request.customer_notes || "No customer notes added."}
                </p>
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Product Request</CardTitle>
                <CardDescription>
                  Product and price snapshot from the checkout request.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Product" value={request.product_name} />
                <DetailItem label="SKU" value={request.sku} />
                <DetailItem label="Quantity" value={request.quantity} />
                <DetailItem label="Unit Price" value={formatCurrency(request.unit_price)} />
                <DetailItem label="Subtotal" value={formatCurrency(request.subtotal_amount)} />
                <DetailItem label="Discount" value={formatCurrency(request.discount_amount)} />
                <DetailItem label="Tax" value={formatCurrency(request.tax_amount)} />
                <DetailItem label="Total" value={formatCurrency(request.total_amount)} />
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Stock and Store</CardTitle>
                <CardDescription>
                  Current inventory and storefront connection.
                </CardDescription>
              </CardHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem
                  label="Current Available Stock"
                  value={availableStock}
                />
                <DetailItem
                  label="Requested Quantity"
                  value={request.quantity}
                />
                <DetailItem
                  label="Store"
                  value={request.stores?.store_name || null}
                />
                <DetailItem
                  label="Store URL"
                  value={
                    request.stores?.store_slug
                      ? `/store/${request.stores.store_slug}`
                      : null
                  }
                />
              </div>

              {request.stores?.store_slug ? (
                <div className="mt-5">
                  <Link
                    href={`/store/${request.stores.store_slug}/products/${request.product_slug}`}
                    className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
                  >
                    View Public Product
                  </Link>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Update Request Status</CardTitle>
                <CardDescription>
                  Accept, reject, cancel, or keep the request pending.
                </CardDescription>
              </CardHeader>

              <form action={updateCheckoutRequestAction} className="space-y-5">
                <input type="hidden" name="requestId" value={request.id} />

                <Select
                  id="status"
                  name="status"
                  label="Request Status"
                  options={requestStatusOptions}
                  defaultValue={
                    request.status === "converted_to_order"
                      ? "accepted"
                      : request.status
                  }
                  required
                />

                <Textarea
                  id="internalNotes"
                  name="internalNotes"
                  label="Internal Notes"
                  defaultValue={request.internal_notes || ""}
                  placeholder="Add review notes, delivery notes, or customer confirmation remarks."
                />

                <div className="flex flex-wrap gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <Button type="submit" variant="primary">
                    Save Request Status
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Convert to Order</CardTitle>
                <CardDescription>
                  Create a confirmed online order from this checkout request.
                </CardDescription>
              </CardHeader>

              {!canConvert ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    Conversion not available
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    This request is already converted, rejected, or cancelled.
                  </p>
                </div>
              ) : (
                <form
                  action={convertCheckoutRequestToOrderAction}
                  className="space-y-5"
                >
                  <input type="hidden" name="requestId" value={request.id} />

                  <Input
                    id="deliveryCharge"
                    name="deliveryCharge"
                    label="Delivery Charge"
                    placeholder="Example: 50"
                    inputMode="decimal"
                    helperText="Optional. This will be added to final order total."
                  />

                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    label="Amount Paid"
                    placeholder="Example: 999"
                    inputMode="decimal"
                    helperText="Leave empty if payment is not collected yet."
                  />

                  <Select
                    id="paymentMethod"
                    name="paymentMethod"
                    label="Payment Method"
                    options={paymentMethodOptions}
                    defaultValue="cod"
                    required
                  />

                  <Input
                    id="transactionReference"
                    name="transactionReference"
                    label="Transaction Reference"
                    placeholder="UPI/card/reference ID if available"
                  />

                  <Textarea
                    id="paymentNotes"
                    name="paymentNotes"
                    label="Payment Notes"
                    placeholder="Optional payment note."
                  />

                  <Textarea
                    id="internalNotes"
                    name="internalNotes"
                    label="Internal Notes"
                    defaultValue={request.internal_notes || ""}
                    placeholder="Order conversion notes."
                  />

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Before converting
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      Confirm customer phone, address, quantity, payment terms,
                      and stock availability. Conversion will reduce inventory
                      and create a confirmed order.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                    <Button type="submit" variant="primary">
                      Convert to Order
                    </Button>

                    <Button href="/client/orders" variant="outline">
                      View Orders
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Request System Details</CardTitle>
                <CardDescription>
                  Review and conversion timestamps.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <DetailItem
                  label="Created At"
                  value={formatDateTime(request.created_at)}
                />
                <DetailItem
                  label="Updated At"
                  value={formatDateTime(request.updated_at)}
                />
                <DetailItem
                  label="Reviewed At"
                  value={formatDateTime(request.reviewed_at)}
                />
                <DetailItem
                  label="Converted Order ID"
                  value={request.converted_order_id}
                />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}