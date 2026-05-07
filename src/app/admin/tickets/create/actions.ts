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

function generateTicketCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `CYT-ONB-${timestamp}${random}`;
}

export async function createTicketAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to create onboarding tickets.");
  }

  const customerName = getRequiredValue(formData, "customerName");
  const mobileNumber = getRequiredValue(formData, "mobileNumber");
  const businessName = getRequiredValue(formData, "businessName");

  const selectedEngine = getRequiredValue(formData, "selectedEngine");
  const priority = getRequiredValue(formData, "priority");
  const status = getRequiredValue(formData, "status");

  const setupCostRaw = getOptionalValue(formData, "setupCost");
  const revenueShareRaw = getOptionalValue(formData, "revenueShare");

  const setupCost = setupCostRaw
    ? Number(setupCostRaw.replace(/[₹,%\s]/g, ""))
    : 0;

  const revenueSharePercentage = revenueShareRaw
    ? Number(revenueShareRaw.replace(/[₹,%\s]/g, ""))
    : 0;

  const { error } = await supabase.from("onboarding_tickets").insert({
    ticket_code: generateTicketCode(),
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
    setup_cost: Number.isFinite(setupCost) ? setupCost : 0,
    revenue_share_percentage: Number.isFinite(revenueSharePercentage)
      ? revenueSharePercentage
      : 0,
    agreement_period: getOptionalValue(formData, "agreementPeriod"),
    follow_up_date: getOptionalValue(formData, "followUpDate"),
    expected_launch_date: getOptionalValue(formData, "expectedLaunchDate"),
    assigned_executive_id: user.id,
    requirement_details: getOptionalValue(formData, "requirementDetails"),
    internal_notes: getOptionalValue(formData, "internalNotes"),
    created_by: user.id,
  });

  if (error) {
    redirect(
      `/admin/tickets/create?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    "/admin/tickets/create?success=Ticket created successfully in Supabase.",
  );
}