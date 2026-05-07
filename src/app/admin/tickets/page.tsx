import { adminNavigation } from "@/config/navigation";
import { adminTickets } from "@/data/admin-tickets";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketPriority, TicketStatus } from "@/types/ticket";

function getStatusVariant(status: TicketStatus) {
  if (status === "Live" || status === "Revenue Monitoring") {
    return "dark" as const;
  }

  if (
    status === "Commercial Discussion" ||
    status === "Approved" ||
    status === "Access Created"
  ) {
    return "outline" as const;
  }

  return "muted" as const;
}

function getPriorityVariant(priority: TicketPriority) {
  if (priority === "High") {
    return "dark" as const;
  }

  if (priority === "Medium") {
    return "outline" as const;
  }

  return "muted" as const;
}

const ticketMetrics = [
  {
    label: "Total Tickets",
    value: String(adminTickets.length),
    helperText: "All onboarding enquiries currently available in demo data.",
  },
  {
    label: "High Priority",
    value: String(
      adminTickets.filter((ticket) => ticket.priority === "High").length,
    ),
    helperText: "Tickets requiring faster CYT executive action.",
  },
  {
    label: "Retail Engine",
    value: String(
      adminTickets.filter(
        (ticket) => ticket.selectedEngine === "Retail Commerce Engine",
      ).length,
    ),
    helperText: "Customers interested in product, POS, inventory, and orders.",
  },
  {
    label: "Pending Follow-ups",
    value: String(adminTickets.length),
    helperText: "Temporary count until follow-up reminders are connected.",
  },
];

export default function AdminTicketsPage() {
  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Ticket Management"
      description="Create, view, update, and track onboarding enquiries from first contact to live customer and revenue monitoring."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Admin Module</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Onboarding Tickets
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This screen will become the control center for CYT Nexus
              executives to manage customer enquiries, requirement collection,
              commercial discussion, access creation, setup progress, and store
              launch tracking.
            </p>
          </div>

          <Button variant="primary">Create Ticket</Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ticketMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helperText={metric.helperText}
            />
          ))}
        </section>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Ticket List</CardTitle>
            <CardDescription>
              Temporary demo data. In the next phases, this table will read and
              write ticket records from Supabase PostgreSQL.
            </CardDescription>
          </CardHeader>

          <div className="overflow-hidden rounded-3xl border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Ticket
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Business
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Engine
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Commercials
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                      Follow-up
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200 bg-white">
                  {adminTickets.map((ticket) => (
                    <tr key={ticket.ticketId} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-semibold text-black">
                          {ticket.ticketId}
                        </p>
                        <div className="mt-2">
                          <Badge variant={getPriorityVariant(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-semibold text-black">
                          {ticket.customerName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {ticket.mobileNumber}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {ticket.email}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-semibold text-black">
                          {ticket.businessName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {ticket.businessCategory}
                        </p>
                        <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-600">
                          {ticket.notes}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-medium text-black">
                          {ticket.selectedEngine}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Source: {ticket.ticketSource}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Assigned: {ticket.assignedExecutive}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-semibold text-black">
                          {ticket.setupCost}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Revenue share: {ticket.revenueShare}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-medium text-black">
                          {ticket.followUpDate}
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}