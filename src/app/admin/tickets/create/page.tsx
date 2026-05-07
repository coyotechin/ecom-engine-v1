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

const engineOptions = [
  {
    label: "Retail Commerce Engine",
    value: "Retail Commerce Engine",
  },
  {
    label: "Learning Commerce Engine",
    value: "Learning Commerce Engine",
  },
  {
    label: "Event Commerce Engine",
    value: "Event Commerce Engine",
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
    value: "Low",
  },
  {
    label: "Medium",
    value: "Medium",
  },
  {
    label: "High",
    value: "High",
  },
];

const statusOptions = [
  {
    label: "New Enquiry",
    value: "New Enquiry",
  },
  {
    label: "Requirement Collected",
    value: "Requirement Collected",
  },
  {
    label: "Engine Suggested",
    value: "Engine Suggested",
  },
  {
    label: "Commercial Discussion",
    value: "Commercial Discussion",
  },
  {
    label: "Approved",
    value: "Approved",
  },
  {
    label: "Access Created",
    value: "Access Created",
  },
  {
    label: "Setup in Progress",
    value: "Setup in Progress",
  },
  {
    label: "Live",
    value: "Live",
  },
  {
    label: "Revenue Monitoring",
    value: "Revenue Monitoring",
  },
  {
    label: "On Hold",
    value: "On Hold",
  },
  {
    label: "Rejected",
    value: "Rejected",
  },
];

export default function CreateTicketPage() {
  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Create Ticket"
      description="Create a new onboarding enquiry for a client interested in Ecom Engine v.1. This form will later save records into Supabase PostgreSQL."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">Ticket Management</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              New Onboarding Ticket
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Collect customer details, business details, engine requirement,
              commercial terms, assigned executive, follow-up date, and internal
              notes.
            </p>
          </div>

          <Button href="/admin/tickets" variant="outline">
            Back to Tickets
          </Button>
        </section>

        <form className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Basic contact details of the customer or business owner.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="customerName"
                name="customerName"
                label="Customer Name"
                placeholder="Example: Mr. A"
              />

              <Input
                id="mobileNumber"
                name="mobileNumber"
                label="Mobile Number"
                placeholder="+91 XXXXX XXXXX"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="customer@example.com"
              />

              <Input
                id="customerAddress"
                name="customerAddress"
                label="Customer Address"
                placeholder="City / area / full address"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Business profile and current selling method.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="businessName"
                name="businessName"
                label="Business Name"
                placeholder="Example: ABC Boutique"
              />

              <Input
                id="businessCategory"
                name="businessCategory"
                label="Business Category"
                placeholder="Example: Fashion Retail"
              />

              <Input
                id="businessLocation"
                name="businessLocation"
                label="Business Location"
                placeholder="Example: Chennai"
              />

              <Input
                id="currentSalesMethod"
                name="currentSalesMethod"
                label="Current Sales Method"
                placeholder="Offline store / WhatsApp / Instagram / Website"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Engine Requirement</CardTitle>
              <CardDescription>
                Select the suitable commerce engine and capture business needs.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                id="selectedEngine"
                name="selectedEngine"
                label="Selected Engine"
                placeholder="Choose engine type"
                options={engineOptions}
              />

              <Select
                id="ticketSource"
                name="ticketSource"
                label="Ticket Source"
                placeholder="Choose source"
                options={ticketSourceOptions}
              />

              <Select
                id="priority"
                name="priority"
                label="Priority"
                placeholder="Choose priority"
                options={priorityOptions}
              />

              <Select
                id="status"
                name="status"
                label="Ticket Status"
                placeholder="Choose status"
                options={statusOptions}
              />

              <Textarea
                id="requirementDetails"
                name="requirementDetails"
                label="Requirement Details"
                helperText="Mention whether the client needs ecommerce, POS, inventory, CRM, delivery, campaigns, payment gateway, or custom frontend."
                placeholder="Example: Client needs online store, POS billing, inventory management, CRM, and basic delivery management."
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Commercial Terms</CardTitle>
              <CardDescription>
                Setup cost, revenue-share percentage, agreement period, and
                follow-up details.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="setupCost"
                name="setupCost"
                label="Setup Cost"
                placeholder="Example: ₹9,999"
              />

              <Input
                id="revenueShare"
                name="revenueShare"
                label="Revenue Share Percentage"
                placeholder="Example: 15%"
              />

              <Input
                id="agreementPeriod"
                name="agreementPeriod"
                label="Agreement Period"
                placeholder="Example: 12 months"
              />

              <Input
                id="followUpDate"
                name="followUpDate"
                type="date"
                label="Follow-up Date"
              />

              <Input
                id="assignedExecutive"
                name="assignedExecutive"
                label="Assigned Executive"
                placeholder="Example: CYT Executive Name"
              />

              <Input
                id="expectedLaunchDate"
                name="expectedLaunchDate"
                type="date"
                label="Expected Launch Date"
              />

              <Textarea
                id="internalNotes"
                name="internalNotes"
                label="Internal Notes"
                helperText="Add discussion notes, client expectations, risks, and next action."
                placeholder="Example: Client wants demo before commercial approval. Follow up after product catalogue collection."
                className="md:col-span-2"
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-black">
                Form status
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Frontend form is ready. Database saving will be added after
                Supabase setup.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/admin/tickets" variant="outline">
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                Save Ticket
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}