import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Retail Commerce Engine | Ecom Engine v.1 | CYT Nexus",
  description:
    "Retail Commerce Engine client dashboard for products, inventory, billing, orders, delivery, CRM, sales data, and reports.",
};

type OrderRow = {
  id: string;
  order_channel: string | null;
  order_status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string | null;
};

type InventoryRow = {
  id: string;
  available_stock: number | null;
  low_stock_alert: number | null;
  products:
    | {
        product_name: string | null;
        price: number | null;
      }
    | null;
};

type CustomerRow = {
  id: string;
  customer_name: string | null;
  phone: string | null;
  total_orders: number | null;
  total_spent: number | null;
};

type CheckoutRequestRow = {
  id: string;
  status: string | null;
};

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ClientButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-50"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{ color: "#FFFFFF" }}
      className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-3 text-sm font-semibold transition hover:bg-neutral-800"
    >
      {children}
    </Link>
  );
}

function MetricCard({
  label,
  value,
  helperText,
}: {
  label: string;
  value: string;
  helperText: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-600">{helperText}</p>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  features,
  href,
}: {
  title: string;
  description: string;
  features: string[];
  href: string;
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-neutral-600">{description}</p>

      <div className="mt-5 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
          >
            <span className="h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-medium text-neutral-700">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <ClientButton href={href} variant="secondary">
          Open Module
        </ClientButton>
      </div>
    </div>
  );
}

export default async function RetailCommerceEnginePage() {
  const supabase = await createClient();

  const [ordersResult, inventoryResult, customersResult, checkoutResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_channel, order_status, payment_status, total_amount, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("inventory")
        .select(
          "id, available_stock, low_stock_alert, products(product_name, price)",
        )
        .order("updated_at", { ascending: false }),

      supabase
        .from("customers")
        .select("id, customer_name, phone, total_orders, total_spent")
        .order("created_at", { ascending: false }),

      supabase
        .from("checkout_requests")
        .select("id, status")
        .order("created_at", { ascending: false }),
    ]);

  const orders = (ordersResult.data || []) as OrderRow[];
  const inventory = (inventoryResult.data || []) as unknown as InventoryRow[];
  const customers = (customersResult.data || []) as CustomerRow[];
  const checkoutRequests = (checkoutResult.data || []) as CheckoutRequestRow[];

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const onlineSales = orders
    .filter(
      (order) =>
        order.order_channel === "online_store" ||
        order.order_channel === "online",
    )
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const storeSales = orders
    .filter(
      (order) =>
        order.order_channel === "pos" ||
        order.order_channel === "offline_store" ||
        order.order_channel === "store",
    )
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const pendingOrders = orders.filter(
    (order) =>
      order.order_status !== "delivered" &&
      order.order_status !== "cancelled" &&
      order.order_status !== "returned",
  );

  const lowStockProducts = inventory.filter(
    (item) =>
      Number(item.available_stock || 0) <= Number(item.low_stock_alert || 0),
  );

  const deliveryPending = orders.filter(
    (order) =>
      order.order_status === "confirmed" ||
      order.order_status === "packed" ||
      order.order_status === "dispatched",
  );

  const pendingCheckoutRequests = checkoutRequests.filter(
    (request) => request.status === "pending",
  );

  const retailMetrics = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSales),
      helperText: "Total retail sales from available order records.",
    },
    {
      label: "Online Sales",
      value: formatCurrency(onlineSales),
      helperText: "Sales generated from online store or online order channels.",
    },
    {
      label: "Store Sales",
      value: formatCurrency(storeSales),
      helperText: "Sales generated from POS or offline store billing.",
    },
    {
      label: "Total Orders",
      value: String(orders.length),
      helperText: "All retail order records available in the system.",
    },
    {
      label: "Pending Orders",
      value: String(pendingOrders.length),
      helperText: "Orders not yet delivered, returned, or cancelled.",
    },
    {
      label: "Low-Stock Products",
      value: String(lowStockProducts.length),
      helperText: "Products at or below low-stock alert level.",
    },
    {
      label: "Customer Count",
      value: String(customers.length),
      helperText: "Customer records created from POS and online workflows.",
    },
    {
      label: "Delivery Pending",
      value: String(deliveryPending.length),
      helperText: "Orders currently in confirmed, packed, or dispatched status.",
    },
  ];

  const retailModules = [
    {
      title: "Inventory Management",
      description:
        "Manage products, stock-in, stock-out, low-stock alerts, stock adjustment, product-wise stock history, and stock reports.",
      href: "/client/inventory",
      features: [
        "Add products",
        "Manage stock",
        "Stock-in and stock-out",
        "Low-stock alerts",
        "Stock adjustment",
        "Product-wise stock history",
        "Stock report",
      ],
    },
    {
      title: "Billing & Orders",
      description:
        "Create and manage store bills, online orders, invoices, payment status, and order status.",
      href: "/client/orders",
      features: [
        "Create/manage store bill",
        "Create/manage online order",
        "Invoice generation",
        "Payment status",
        "Order status",
      ],
    },
    {
      title: "Delivery Management",
      description:
        "Track delivery status, assign delivery, manage customer address, delivery notes, and dispatch status.",
      href: "/client/orders",
      features: [
        "Delivery status",
        "Assign delivery",
        "Customer address",
        "Delivery notes",
        "Order dispatch status",
      ],
    },
    {
      title: "Sales Data",
      description:
        "View online sales, store sales, total sales, product-wise sales, category-wise sales, staff-wise sales, and date-filtered performance.",
      href: "/client/reports",
      features: [
        "Online sales",
        "Store sales",
        "Total sales",
        "Product-wise sales",
        "Category-wise sales",
        "Staff-wise sales",
        "Date filter",
      ],
    },
    {
      title: "Marketing & CRM",
      description:
        "Manage customer database, purchase history, segmentation, campaigns, follow-up reminders, and WhatsApp/email support.",
      href: "/client/crm",
      features: [
        "Customer database",
        "Purchase history",
        "Customer segmentation",
        "Create campaign",
        "Follow-up reminders",
        "WhatsApp/email campaign support",
      ],
    },
    {
      title: "Reports",
      description:
        "Access sales reports, profit-ready reports, stock reports, product performance, and date-wise revenue reports.",
      href: "/client/reports",
      features: [
        "Sales report",
        "Profit report",
        "Stock report",
        "Product performance report",
        "Date-wise revenue report",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/client/retail" className="inline-flex flex-col">
            <span className="text-3xl font-semibold tracking-[0.32em] text-black uppercase sm:text-4xl">
              CYT Nexus
            </span>

            <span className="mt-3 text-base font-medium tracking-[-0.03em] text-neutral-600">
              Retail Commerce Engine
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <ClientButton href="/client/products" variant="secondary">
              Products
            </ClientButton>

            <ClientButton href="/client/pos">Create Bill</ClientButton>

            <ClientButton href="/client/reports" variant="secondary">
              Reports
            </ClientButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-700">
              Client Portal · Retail Commerce Engine
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">
              Retail operations dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600">
              Manage retail products, inventory, billing, online orders,
              delivery status, customer CRM, sales data, and revenue reports
              from one client engine dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Pending Checkout Requests
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-black">
              {pendingCheckoutRequests.length}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {retailMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Revenue Trend
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
                  Retail sales snapshot
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Beta graph placeholder showing overall retail revenue
                  direction. Advanced date filters will be connected later.
                </p>
              </div>

              <ClientButton href="/client/reports" variant="secondary">
                View Full Reports
              </ClientButton>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Total Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  {formatCurrency(totalSales)}
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Online Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  {formatCurrency(onlineSales)}
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-500">
                  Store Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  {formatCurrency(storeSales)}
                </p>
              </div>
            </div>

            <div className="mt-6 h-56 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex h-full items-end gap-4">
                {[35, 52, 44, 68, 74, 90].map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end rounded-t-2xl"
                  >
                    <div
                      className="w-full rounded-t-2xl bg-black"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Quick Actions
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-black">
              Retail workflow shortcuts
            </h2>

            <div className="mt-6 grid gap-3">
              <ClientButton href="/client/products">Manage Products</ClientButton>
              <ClientButton href="/client/inventory" variant="secondary">
                Manage Inventory
              </ClientButton>
              <ClientButton href="/client/pos">Create Store Bill</ClientButton>
              <ClientButton href="/client/orders" variant="secondary">
                View Orders
              </ClientButton>
              <ClientButton href="/client/crm" variant="secondary">
                Customer CRM
              </ClientButton>
              <ClientButton href="/client/checkout-requests">
                Checkout Requests
              </ClientButton>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Retail Modules
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">
              Features available in this engine
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {retailModules.map((module) => (
              <ModuleCard
                key={module.title}
                title={module.title}
                description={module.description}
                features={module.features}
                href={module.href}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}