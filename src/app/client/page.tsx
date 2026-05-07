import { clientNavigation } from "@/config/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const clientMetrics = [
  {
    label: "Total Sales",
    value: "₹0",
    helperText: "Total sales generated through online and POS channels.",
  },
  {
    label: "Online Orders",
    value: "0",
    helperText: "Orders received through the customer storefront.",
  },
  {
    label: "POS Sales",
    value: "0",
    helperText: "Offline billing transactions created by store staff.",
  },
  {
    label: "Low Stock",
    value: "0",
    helperText: "Products that need inventory attention.",
  },
];

const storeSetupTasks = [
  {
    title: "Store profile",
    description: "Add store name, logo, contact details, and business address.",
    status: "Pending",
  },
  {
    title: "Product catalogue",
    description: "Add products, SKU, price, tax, images, and visibility.",
    status: "Pending",
  },
  {
    title: "Inventory setup",
    description: "Add stock quantity, low-stock alert, and stock history.",
    status: "Pending",
  },
  {
    title: "Payment and delivery",
    description: "Configure payment preference, delivery areas, and charges.",
    status: "Pending",
  },
  {
    title: "Store review",
    description: "Submit the store for CYT Nexus review before going live.",
    status: "Pending",
  },
];

const businessModules = [
  {
    title: "Store Builder",
    description:
      "Configure store logo, banner, contact details, delivery areas, policies, and launch status.",
  },
  {
    title: "Product Management",
    description:
      "Add, edit, archive, categorize, price, and publish products for online and POS sales.",
  },
  {
    title: "Inventory Management",
    description:
      "Track stock-in, stock-out, adjustments, low-stock products, and product-wise stock history.",
  },
  {
    title: "POS Billing",
    description:
      "Create offline store bills, capture customer phone numbers, accept payments, and update stock.",
  },
  {
    title: "Order Management",
    description:
      "Manage online orders, packing, shipping, delivery status, cancellations, returns, and payment status.",
  },
  {
    title: "CRM",
    description:
      "Maintain customer database, purchase history, follow-ups, segmentation, and repeat buyer tracking.",
  },
];

const recentOrders = [
  {
    order: "No orders yet",
    customer: "Store setup required",
    status: "Draft",
  },
  {
    order: "POS not active",
    customer: "Add products first",
    status: "Pending",
  },
  {
    order: "Storefront not live",
    customer: "Submit for review",
    status: "Setup",
  },
];

export default function ClientPage() {
  return (
    <DashboardShell
      portalLabel="Client Exclusive"
      portalName="Client Portal"
      description="Manage store setup, products, inventory, POS billing, online orders, CRM, delivery, campaigns, staff access, and business reports."
      navigation={clientNavigation}
    >
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {clientMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Client Business Modules</CardTitle>
              <CardDescription>
                These modules will help the client manage the full commerce
                operation before and after launch.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-3 md:grid-cols-2">
              {businessModules.map((module) => (
                <div
                  key={module.title}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-black">
                      {module.title}
                    </h3>
                    <Badge variant="muted">v.1</Badge>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Store Launch Checklist</CardTitle>
                <CardDescription>
                  Basic setup items required before the store can go live.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {storeSetupTasks.map((task) => (
                  <div
                    key={task.title}
                    className="rounded-2xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          {task.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          {task.description}
                        </p>
                      </div>

                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Recent Business Activity</CardTitle>
                <CardDescription>
                  Temporary activity preview until database connection is added.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {recentOrders.map((item) => (
                  <div
                    key={item.order}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {item.order}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.customer}
                      </p>
                    </div>

                    <Badge
                      variant={
                        item.status === "Draft"
                          ? "muted"
                          : item.status === "Pending"
                            ? "outline"
                            : "default"
                      }
                    >
                      {item.status}
                    </Badge>
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