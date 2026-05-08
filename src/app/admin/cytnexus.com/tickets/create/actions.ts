"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getRequiredValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function getOptionalValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value || null;
}

function parseNumber(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[₹,%\s]/g, ""));

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function generateTicketCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `CYT-ONB-${timestamp}${random}`;
}

export async function createHiddenAdminTicketAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/admin/cytnexus.com?error=${encodeURIComponent(
        "Please login as CYT Nexus admin to create onboarding tickets.",
      )}`,
    );
  }

  const customerName = getRequiredValue(formData, "customerName");
  const mobileNumber = getRequiredValue(formData, "mobileNumber");
  const businessName = getRequiredValue(formData, "businessName");
  const selectedEngine = getRequiredValue(formData, "selectedEngine");
  const priority = getRequiredValue(formData, "priority");
  const status = getRequiredValue(formData, "status");

  const setupCost = parseNumber(getOptionalValue(formData, "setupCost"));
  const revenueSharePercentage = parseNumber(
    getOptionalValue(formData, "revenueSharePercentage"),
  );

  const ticketCode = generateTicketCode();

  const { error } = await supabase.from("onboarding_tickets").insert({
    ticket_code: ticketCode,

    customer_name: customerName,
    mobile_number: mobileNumber,
    email: getOptionalValue(formData, "email"),
    customer_address: getOptionalValue(formData, "customerAddress"),

    business_name: businessName,
    business_category: getOptionalValue(formData, "businessCategory"),
    business_location: getOptionalValue(formData, "businessLocation"),
    current_sales_method: getOptionalValue(formData, "currentSalesMethod"),

    selected_engine: selectedEngine,
    ticket_source: getOptionalValue(formData, "ticketSource"),
    priority,
    status,

    setup_cost: setupCost,
    revenue_share_percentage: revenueSharePercentage,
    agreement_period: getOptionalValue(formData, "agreementPeriod"),
    payment_status: getOptionalValue(formData, "paymentStatus"),
    settlement_cycle: getOptionalValue(formData, "settlementCycle"),

    follow_up_date: getOptionalValue(formData, "followUpDate"),
    expected_launch_date: getOptionalValue(formData, "expectedLaunchDate"),
    assigned_executive_id: user.id,
    assigned_executive_name: getOptionalValue(formData, "assignedExecutiveName"),

    requirement_details: getOptionalValue(formData, "requirementDetails"),
    internal_notes: getOptionalValue(formData, "internalNotes"),

    client_access_status: "not_created",
    domain_status: "not_started",
    custom_domain: getOptionalValue(formData, "customDomain"),
    subdomain: getOptionalValue(formData, "subdomain"),
    storefront_status: getOptionalValue(formData, "storefrontStatus"),
    storefront_notes: getOptionalValue(formData, "storefrontNotes"),

    created_by: user.id,
  });

  if (error) {
    redirect(
      `/admin/cytnexus.com/tickets/create?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    action: "hidden_admin_ticket_created",
    entity_type: "onboarding_ticket",
    entity_id: ticketCode,
    description: `Hidden admin onboarding ticket created: ${ticketCode}.`,
    metadata: {
      ticketCode,
      customerName,
      businessName,
      selectedEngine,
      status,
      setupCost,
      revenueSharePercentage,
    },
  });

  redirect(
    `/admin/cytnexus.com/tickets/create?success=${encodeURIComponent(
      `Ticket ${ticketCode} created successfully.`,
    )}`,
  );
}