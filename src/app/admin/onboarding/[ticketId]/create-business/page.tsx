import { notFound } from "next/navigation";
import { createBusinessFromTicketAction } from "@/app/admin/onboarding/[ticketId]/create-business/actions";
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

type CreateBusinessPageProps = {
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
  selected_engine: "retail" | "learning" | "event";
  revenue_share_percentage: number | null;
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

const settlementCycleOptions = [
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Quarterly",
    value: "quarterly",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

function createSuggestedSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function CreateBusinessFromTicketPage({
  params,
  searchParams,
}: CreateBusinessPageProps) {
  const { ticketId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("onboarding_tickets")
    .select(
      "id, ticket_code, customer_name, mobile_number, email, customer_address, business_name, business_category, business_location, selected_engine, revenue_share_percentage, requirement_details, internal_notes",
    )
    .eq("id", ticketId)
    .single();

  if (fetchError || !data) {
    notFound();
  }

  const ticket = data as TicketRow;
  const suggestedSlug = createSuggestedSlug(ticket.business_name);

  return (
    <DashboardShell
      portalLabel="CYT Executive Exclusive"
      portalName="Create Business"
      description="Convert an approved onboarding ticket into a client business profile, draft store setup, and revenue-share rule."
      navigation={adminNavigation}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="dark">{ticket.ticket_code}</Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">
              Convert {ticket.business_name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              This workflow creates the client business profile, draft store,
              and revenue-share configuration from the approved ticket.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/admin/onboarding" variant="outline">
              Back to Onboarding
            </Button>

            <Button href={`/admin/tickets/${ticket.id}`} variant="secondary">
              View Ticket
            </Button>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-black">
              Business creation failed
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{error}</p>
          </div>
        ) : null}

        <form action={createBusinessFromTicketAction} className="space-y-6">
          <input type="hidden" name="ticketId" value={ticket.id} />

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Client Business Profile</CardTitle>
              <CardDescription>
                Create the official client business record connected to CYT
                Nexus onboarding.
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
                id="ownerName"
                name="ownerName"
                label="Owner Name"
                defaultValue={ticket.customer_name}
                required
              />

              <Input
                id="phone"
                name="phone"
                label="Phone Number"
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
                id="gstNumber"
                name="gstNumber"
                label="GST Number"
                placeholder="Optional"
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

              <Select
                id="engineType"
                name="engineType"
                label="Engine Type"
                options={engineOptions}
                defaultValue={ticket.selected_engine}
                required
              />

              <Textarea
                id="businessAddress"
                name="businessAddress"
                label="Business Address"
                defaultValue={ticket.customer_address || ""}
                className="md:col-span-2"
              />

              <Textarea
                id="businessNotes"
                name="businessNotes"
                label="Business Notes"
                defaultValue={
                  ticket.requirement_details || ticket.internal_notes || ""
                }
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Draft Store Setup</CardTitle>
              <CardDescription>
                Create the initial store record. The client can complete full
                store setup later from the Client Portal.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="storeName"
                name="storeName"
                label="Store Name"
                defaultValue={ticket.business_name}
                required
              />

              <Input
                id="storeSlug"
                name="storeSlug"
                label="Store Slug"
                defaultValue={suggestedSlug}
                helperText="This creates the public store URL path."
              />

              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                label="WhatsApp Number"
                defaultValue={ticket.mobile_number}
              />

              <Input
                id="deliveryAreas"
                name="deliveryAreas"
                label="Delivery Areas"
                placeholder="Example: Chennai, Tambaram, Velachery"
              />

              <Input
                id="paymentMethods"
                name="paymentMethods"
                label="Payment Methods"
                placeholder="Example: COD, UPI, Razorpay"
              />

              <Textarea
                id="brandDescription"
                name="brandDescription"
                label="Brand Description"
                placeholder="Short description about the store or brand."
                className="md:col-span-2"
              />

              <Textarea
                id="returnPolicy"
                name="returnPolicy"
                label="Return Policy"
                placeholder="Basic return policy for the storefront."
              />

              <Textarea
                id="privacyPolicy"
                name="privacyPolicy"
                label="Privacy Policy"
                placeholder="Basic privacy policy for customer data."
              />

              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                label="Terms and Conditions"
                placeholder="Basic store terms."
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Revenue Share Rule</CardTitle>
              <CardDescription>
                Configure CYT Nexus revenue-sharing terms for this client.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="revenueSharePercentage"
                name="revenueSharePercentage"
                label="Revenue Share Percentage"
                inputMode="decimal"
                defaultValue={String(ticket.revenue_share_percentage || 0)}
              />

              <Select
                id="settlementCycle"
                name="settlementCycle"
                label="Settlement Cycle"
                options={settlementCycleOptions}
                defaultValue="monthly"
                required
              />

              <Textarea
                id="paymentDeductionRules"
                name="paymentDeductionRules"
                label="Payment Deduction Rules"
                placeholder="Example: Gateway fees deducted before revenue-share calculation."
              />

              <Textarea
                id="refundHandlingRule"
                name="refundHandlingRule"
                label="Refund Handling Rule"
                placeholder="Example: Refunded orders excluded from net revenue."
              />

              <Textarea
                id="taxHandlingRule"
                name="taxHandlingRule"
                label="Tax Handling Rule"
                placeholder="Example: Revenue share calculated before/after GST as per agreement."
              />

              <Textarea
                id="paymentGatewayFeeHandling"
                name="paymentGatewayFeeHandling"
                label="Payment Gateway Fee Handling"
                placeholder="Example: Razorpay/UPI charges borne by client."
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-black">
                Convert ticket
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                This will create business, store, revenue-share rule, and update
                the ticket status to Access Created.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/admin/onboarding" variant="outline">
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                Create Business
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}