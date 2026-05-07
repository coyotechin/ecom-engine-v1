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

export default async function ClientCrmPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, business_id, store_id, customer_name, phone, email, address, city, state, pincode, notes, total_orders, total_spent, last_order_at, is_active, created_at, updated_at, stores(store_name, store_slug)",
    )
    .order("last_order_at", { ascending: false, nullsFirst: false });

  const customers = (data || []) as unknown as CustomerRow[];

  const activeCustomers = customers.filter((customer) => customer.is_active);
  const repeatCustomers = customers.filter(
    (customer) => customer.total_orders >= 2,
  );
  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.total_spent || 0),
    0,
  );

  const topCustomer = customers.reduce<CustomerRow | null>((top, customer) => {
    if (!top) {
      return customer;
    }

    return Number(customer.total_spent || 0) > Number(top.total_spent || 0)
      ? customer
      : top;
  }, null);

  const crmMetrics = [
    {
      label: "Total Customers",
      value: String(customers.length),
      helperText: "Customers created through POS and future online orders.",
    },
    {
      label: "Active Customers",
      value: String(activeCustomers.length),
      helperText: "Customers currently marked as active.",
    },
    {
      label: "Repeat Customers",
      value: String(repeatCustomers.length),
      helperText: "Customers with two or more orders.",
    },
    {
      label: "Customer Revenue",
      value: formatCurrency(totalRevenue),
      helperText: "Total spend recorded across all customers.",
    },
  ];

  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="CRM"
      description="Track customer records, repeat buyers, purchase value, contact information, and customer relationship history."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Client Module</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Customer CRM
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              View customer profiles created during POS billing. This CRM will
              later support follow-ups, segmentation, campaigns, repeat buyer
              tracking, and customer notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/client/pos" variant="primary">
              Create POS Bill
            </Button>

            <Button href="/client/orders" variant="outline">
              View Orders
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Could not load customers
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {error.message}
            </p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {crmMetrics.map((metric) => (
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
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                Live customer records from Supabase. POS billing creates or
                updates customer profiles using phone number.
              </CardDescription>
            </CardHeader>

            {customers.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-black">
                  No customers found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Create a POS bill first. The customer entered during billing
                  will automatically appear in CRM.
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
                  <table className="w-full min-w-[1050px] border-collapse text-left">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Customer
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Contact
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Store
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Orders
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Total Spent
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                          Last Order
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {customers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {customer.customer_name}
                            </p>

                            <div className="mt-2">
                              <Badge variant={getCustomerVariant(customer)}>
                                {getCustomerLabel(customer)}
                              </Badge>
                            </div>

                            <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                              {customer.notes || "No customer notes added."}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {customer.phone}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {customer.email || "No email"}
                            </p>

                            <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                              {customer.address || "No address"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {customer.stores?.store_name || "No store linked"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {customer.stores?.store_slug
                                ? `/store/${customer.stores.store_slug}`
                                : "No store URL"}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-2xl font-semibold tracking-[-0.04em] text-black">
                              {customer.total_orders}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(customer.total_spent)}
                            </p>
                          </td>

                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-medium text-black">
                              {formatDate(customer.last_order_at)}
                            </p>

                            <Link
                              href={`/client/crm/${customer.id}`}
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
                <CardTitle>Top Customer</CardTitle>
                <CardDescription>
                  Highest spending customer from available records.
                </CardDescription>
              </CardHeader>

              {topCustomer ? (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <Badge variant={getCustomerVariant(topCustomer)}>
                    {getCustomerLabel(topCustomer)}
                  </Badge>

                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                    {topCustomer.customer_name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Phone: {topCustomer.phone}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Orders: {topCustomer.total_orders}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Total spent: {formatCurrency(topCustomer.total_spent)}
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-black">
                    No customer data yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Top customer will appear after POS orders are created.
                  </p>
                </div>
              )}
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>CRM Notes</CardTitle>
                <CardDescription>
                  Current v.1 CRM behavior.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {[
                  "Customers are created automatically during POS billing.",
                  "Phone number is used to identify repeat customers.",
                  "Total orders and total spent update after each order.",
                  "Customer detail page and notes editing will be added next.",
                  "Campaign segmentation will be added in later CRM upgrades.",
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
                  Continue customer and sales workflows.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-3">
                <Button href="/client/pos" variant="primary">
                  Create POS Bill
                </Button>

                <Button href="/client/orders" variant="outline">
                  View Orders
                </Button>

                <Button href="/client/reports" variant="secondary">
                  Reports Preview
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}