import { notFound } from "next/navigation";
import { updateTicketAction } from "@/app/admin/tickets/[ticketId]/edit/actions";
import { createClient } from "@/lib/supabase/server";
import { adminNavigation } from "@/config/navigation";
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

type EditTicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

type TicketRow = {
  id: string;
  ticket_code: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  customer_address: string | null;
  business_name: string;
  business_category: string | null;
  business_location: string | null;
  current_sales_method: string | null;
  selected_engine: string;
  ticket_source: string | null;
  priority: string;
  status: string;
  setup_cost: number | null;
  revenue_share_percentage: number | null;
  agreement_period: string | null;
  follow_up_date: string | null;
  expected_launch_date: string | null;
  requirement_details: string | null;
  internal_notes: string | null;
};

const engineOptions = [
  {
    label: "Retail Commerce Engine",
    value: "retail",
  },
  {
    label: "Learning Commerce Engine",
    value: "learning",
  },
  {
    label: "Event Commerce Engine",
    value: "event",
  },
];

const ticketSourceOptions = [
  {
    label: "Walk-in",
    value: "Walk-in",
  },
  {
    label: "WhatsApp",
    value: "WhatsApp",
  },
  {
    label: "Phone Call",
    value: "Phone Call",
  },
  {
    label: "Website",
    value: "Website",
  },
  {
    label: "Referral",
    value: "Referral",
  },
  {
    label: "Social Media",
    value: "Social Media",
  },
];

const priorityOptions = [
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "High",
    value: "high",
  },
];

const statusOptions = [
  {
    label: "New Enquiry",
    value: "new_enquiry",
  },
  {
    label: "Requirement Collected",
    value: "requirement_collected",
  },
  {
    label: "Engine Suggested",
    value: "engine_suggested",
  },
  {
    label: "Commercial Discussion",
    value: "commercial_discussion",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Access Created",
    value: "access_created",
  },
  {
    label: "Setup in Progress",
    value: "setup_in_progress",
  },
  {
    label: "Live",
    value: "live",
  },
  {
    label: "Revenue Monitoring",
    value: "revenue_monitoring",
  },
  {
    label: "On Hold",
    value: "on_hold",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

function dateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export default async function EditTicketPage({
  params,
  searchParams,
}: EditTicketPageProps) {
  const { ticketId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("onboarding_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (fetchError || !data) {
    notFound();
  }

  const ticket = data as TicketRow;

  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Edit Ticket"
      description="Update onboarding enquiry details, workflow status, requirement notes, commercial terms, and follow-up data."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">{ticket.ticket_code}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Edit {ticket.business_name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Update this ticket as the customer moves through the CYT Nexus
              onboarding-to-launch workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href={`/admin/tickets/${ticket.id}`} variant="outline">
              Back to Detail
            </Button>

            <Button href="/admin/tickets" variant="secondary">
              All Tickets
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Ticket update failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <form action={updateTicketAction} className="space-y-6">
          <input type="hidden" name="ticketId" value={ticket.id} />

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Update the customer or business owner contact details.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="customerName"
                name="customerName"
                label="Customer Name"
                defaultValue={ticket.customer_name}
                required
              />

              <Input
                id="mobileNumber"
                name="mobileNumber"
                label="Mobile Number"
                defaultValue={ticket.mobile_number}
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                defaultValue={ticket.email || ""}
              />

              <Input
                id="customerAddress"
                name="customerAddress"
                label="Customer Address"
                defaultValue={ticket.customer_address || ""}
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update business profile and current selling method.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="businessName"
                name="businessName"
                label="Business Name"
                defaultValue={ticket.business_name}
                required
              />

              <Input
                id="businessCategory"
                name="businessCategory"
                label="Business Category"
                defaultValue={ticket.business_category || ""}
              />

              <Input
                id="businessLocation"
                name="businessLocation"
                label="Business Location"
                defaultValue={ticket.business_location || ""}
              />

              <Input
                id="currentSalesMethod"
                name="currentSalesMethod"
                label="Current Sales Method"
                defaultValue={ticket.current_sales_method || ""}
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Engine Requirement</CardTitle>
              <CardDescription>
                Update selected engine, ticket source, priority, and status.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="selectedEngine"
                name="selectedEngine"
                label="Selected Engine"
                options={engineOptions}
                defaultValue={ticket.selected_engine}
                required
              />

              <Select
                id="ticketSource"
                name="ticketSource"
                label="Ticket Source"
                options={ticketSourceOptions}
                defaultValue={ticket.ticket_source || ""}
              />

              <Select
                id="priority"
                name="priority"
                label="Priority"
                options={priorityOptions}
                defaultValue={ticket.priority}
                required
              />

              <Select
                id="status"
                name="status"
                label="Ticket Status"
                options={statusOptions}
                defaultValue={ticket.status}
                required
              />

              <Textarea
                id="requirementDetails"
                name="requirementDetails"
                label="Requirement Details"
                defaultValue={ticket.requirement_details || ""}
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Commercial Terms</CardTitle>
              <CardDescription>
                Update setup cost, revenue-share percentage, agreement period,
                follow-up date, and launch target.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="setupCost"
                name="setupCost"
                label="Setup Cost"
                inputMode="decimal"
                defaultValue={String(ticket.setup_cost || 0)}
              />

              <Input
                id="revenueShare"
                name="revenueShare"
                label="Revenue Share Percentage"
                inputMode="decimal"
                defaultValue={String(ticket.revenue_share_percentage || 0)}
              />

              <Input
                id="agreementPeriod"
                name="agreementPeriod"
                label="Agreement Period"
                defaultValue={ticket.agreement_period || ""}
              />

              <Input
                id="followUpDate"
                name="followUpDate"
                type="date"
                label="Follow-up Date"
                defaultValue={dateInputValue(ticket.follow_up_date)}
              />

              <Input
                id="expectedLaunchDate"
                name="expectedLaunchDate"
                type="date"
                label="Expected Launch Date"
                defaultValue={dateInputValue(ticket.expected_launch_date)}
              />

              <Textarea
                id="internalNotes"
                name="internalNotes"
                label="Internal Notes"
                defaultValue={ticket.internal_notes || ""}
                className="md:col-span-2"
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-black">
                Update ticket
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Changes will be saved directly to Supabase.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href={`/admin/tickets/${ticket.id}`} variant="outline">
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}