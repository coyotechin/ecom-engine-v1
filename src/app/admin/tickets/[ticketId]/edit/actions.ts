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

function parseMoneyValue(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[₹,%\s]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export async function updateTicketAction(formData: FormData) {
  const ticketId = getRequiredValue(formData, "ticketId");

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to update onboarding tickets.");
  }

  const customerName = getRequiredValue(formData, "customerName");
  const mobileNumber = getRequiredValue(formData, "mobileNumber");
  const businessName = getRequiredValue(formData, "businessName");
  const selectedEngine = getRequiredValue(formData, "selectedEngine");
  const priority = getRequiredValue(formData, "priority");
  const status = getRequiredValue(formData, "status");

  const setupCost = parseMoneyValue(getOptionalValue(formData, "setupCost"));
  const revenueSharePercentage = parseMoneyValue(
    getOptionalValue(formData, "revenueShare"),
  );

  const { error } = await supabase
    .from("onboarding_tickets")
    .update({
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
      follow_up_date: getOptionalValue(formData, "followUpDate"),
      expected_launch_date: getOptionalValue(formData, "expectedLaunchDate"),
      requirement_details: getOptionalValue(formData, "requirementDetails"),
      internal_notes: getOptionalValue(formData, "internalNotes"),
    })
    .eq("id", ticketId);

  if (error) {
    redirect(
      `/admin/tickets/${ticketId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(`/admin/tickets/${ticketId}`);
}