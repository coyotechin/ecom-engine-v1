import { adminNavigation } from "@/config/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const adminMetrics = [
  {
    label: "Total Tickets",
    value: "0",
    helperText: "Onboarding enquiries created by CYT executives.",
  },
  {
    label: "New Tickets",
    value: "0",
    helperText: "Fresh enquiries waiting for first action.",
  },
  {
    label: "Live Stores",
    value: "0",
    helperText: "Client stores successfully launched.",
  },
  {
    label: "CYT Revenue Share",
    value: "₹0",
    helperText: "Revenue-share value tracked for CYT Nexus.",
  },
];

const setupTasks = [
  "Create onboarding ticket database",
  "Build ticket creation form",
  "Create client business profile schema",
  "Add role-based login",
  "Connect revenue-share rules",
];

const recentActivities = [
  {
    title: "Admin dashboard layout created",
    status: "Completed",
  },
  {
    title: "Ticket management module pending",
    status: "Next",
  },
  {
    title: "Supabase database setup pending",
    status: "Upcoming",
  },
];

export default function AdminPage() {
  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Admin Portal"
      description="Manage onboarding tickets, customer requirements, client access, revenue-share setup, CRM, reports, and store launch workflow for Ecom Engine v.1."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminMetrics.map((metric) => (
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
              <CardTitle>Admin Portal Modules</CardTitle>
              <CardDescription>
                These are the primary v.1 modules planned for the CYT Nexus
                onboarding console.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-3 md:grid-cols-2">
              {adminNavigation.map((item) => (
                <div
                  key={item.href}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-black">
                      {item.label}
                    </h3>
                    <Badge variant="muted">v.1</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Setup Checklist</CardTitle>
                <CardDescription>
                  Development tasks before this portal becomes functional.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {setupTasks.map((task) => (
                  <div
                    key={task}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                  >
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span className="text-sm font-medium text-neutral-700">
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Temporary development activity preview.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.title}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-neutral-700">
                      {activity.title}
                    </p>
                    <Badge
                      variant={
                        activity.status === "Completed"
                          ? "dark"
                          : activity.status === "Next"
                            ? "outline"
                            : "muted"
                      }
                    >
                      {activity.status}
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