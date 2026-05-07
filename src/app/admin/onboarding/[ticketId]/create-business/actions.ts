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

function createStoreSlug(storeName: string) {
  const baseSlug = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const suffix = Date.now().toString().slice(-5);

  return `${baseSlug || "store"}-${suffix}`;
}

function parsePercentage(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[₹,%\s]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export async function createBusinessFromTicketAction(formData: FormData) {
  const ticketId = getRequiredValue(formData, "ticketId");

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to create client businesses.");
  }

  const businessName = getRequiredValue(formData, "businessName");
  const ownerName = getRequiredValue(formData, "ownerName");
  const phone = getRequiredValue(formData, "phone");
  const engineType = getRequiredValue(formData, "engineType");
  const storeName = getRequiredValue(formData, "storeName");

  const revenueSharePercentage = parsePercentage(
    getOptionalValue(formData, "revenueSharePercentage"),
  );

  const storeSlug =
    getOptionalValue(formData, "storeSlug") || createStoreSlug(storeName);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      business_name: businessName,
      owner_name: ownerName,
      phone,
      email: getOptionalValue(formData, "email"),
      gst_number: getOptionalValue(formData, "gstNumber"),
      business_category: getOptionalValue(formData, "businessCategory"),
      business_location: getOptionalValue(formData, "businessLocation"),
      business_address: getOptionalValue(formData, "businessAddress"),
      engine_type: engineType,
      onboarding_status: "access_created",
      assigned_executive_id: user.id,
      notes: getOptionalValue(formData, "businessNotes"),
      is_active: true,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    redirect(
      `/admin/onboarding/${ticketId}/create-business?error=${encodeURIComponent(
        businessError?.message || "Could not create business profile.",
      )}`,
    );
  }

  const { error: storeError } = await supabase.from("stores").insert({
    business_id: business.id,
    store_name: storeName,
    store_slug: storeSlug,
    contact_number: phone,
    whatsapp_number: getOptionalValue(formData, "whatsappNumber"),
    email: getOptionalValue(formData, "email"),
    business_address: getOptionalValue(formData, "businessAddress"),
    brand_description: getOptionalValue(formData, "brandDescription"),
    delivery_areas: getOptionalValue(formData, "deliveryAreas"),
    payment_methods: getOptionalValue(formData, "paymentMethods"),
    return_policy: getOptionalValue(formData, "returnPolicy"),
    privacy_policy: getOptionalValue(formData, "privacyPolicy"),
    terms_and_conditions: getOptionalValue(formData, "termsAndConditions"),
    status: "draft",
    is_active: true,
  });

  if (storeError) {
    redirect(
      `/admin/onboarding/${ticketId}/create-business?error=${encodeURIComponent(
        storeError.message,
      )}`,
    );
  }

  const { error: revenueRuleError } = await supabase
    .from("revenue_share_rules")
    .insert({
      business_id: business.id,
      revenue_share_percentage: revenueSharePercentage,
      settlement_cycle: getRequiredValue(formData, "settlementCycle"),
      payment_deduction_rules: getOptionalValue(
        formData,
        "paymentDeductionRules",
      ),
      refund_handling_rule: getOptionalValue(formData, "refundHandlingRule"),
      tax_handling_rule: getOptionalValue(formData, "taxHandlingRule"),
      payment_gateway_fee_handling: getOptionalValue(
        formData,
        "paymentGatewayFeeHandling",
      ),
      cyt_commission_status: "active",
      is_active: true,
    });

  if (revenueRuleError) {
    redirect(
      `/admin/onboarding/${ticketId}/create-business?error=${encodeURIComponent(
        revenueRuleError.message,
      )}`,
    );
  }

  const { error: ticketUpdateError } = await supabase
    .from("onboarding_tickets")
    .update({
      status: "access_created",
      converted_business_id: business.id,
    })
    .eq("id", ticketId);

  if (ticketUpdateError) {
    redirect(
      `/admin/onboarding/${ticketId}/create-business?error=${encodeURIComponent(
        ticketUpdateError.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: business.id,
    action: "business_created_from_ticket",
    entity_type: "business",
    entity_id: business.id,
    description: `Business profile and draft store created from onboarding ticket ${ticketId}.`,
    metadata: {
      ticketId,
      storeSlug,
    },
  });

  redirect(
    `/admin/onboarding?success=${encodeURIComponent(
      "Business, store, and revenue-share rule created successfully.",
    )}`,
  );
}