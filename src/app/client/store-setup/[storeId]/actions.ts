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

function createSafeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateStoreSetupAction(formData: FormData) {
  const storeId = getRequiredValue(formData, "storeId");
  const businessId = getRequiredValue(formData, "businessId");

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to update store setup.");
  }

  const storeName = getRequiredValue(formData, "storeName");
  const rawStoreSlug = getRequiredValue(formData, "storeSlug");
  const storeSlug = createSafeSlug(rawStoreSlug);

  if (!storeSlug) {
    redirect(
      `/client/store-setup/${storeId}?error=${encodeURIComponent(
        "Store slug is invalid. Use letters, numbers, and simple words.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("stores")
    .update({
      store_name: storeName,
      store_slug: storeSlug,
      store_logo_url: getOptionalValue(formData, "storeLogoUrl"),
      store_banner_url: getOptionalValue(formData, "storeBannerUrl"),
      brand_description: getOptionalValue(formData, "brandDescription"),
      contact_number: getOptionalValue(formData, "contactNumber"),
      whatsapp_number: getOptionalValue(formData, "whatsappNumber"),
      email: getOptionalValue(formData, "email"),
      business_address: getOptionalValue(formData, "businessAddress"),
      delivery_areas: getOptionalValue(formData, "deliveryAreas"),
      payment_methods: getOptionalValue(formData, "paymentMethods"),
      return_policy: getOptionalValue(formData, "returnPolicy"),
      privacy_policy: getOptionalValue(formData, "privacyPolicy"),
      terms_and_conditions: getOptionalValue(formData, "termsAndConditions"),
      status: getRequiredValue(formData, "status"),
    })
    .eq("id", storeId);

  if (error) {
    redirect(
      `/client/store-setup/${storeId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: businessId,
    action: "store_setup_updated",
    entity_type: "store",
    entity_id: storeId,
    description: `Store setup updated for ${storeName}.`,
    metadata: {
      storeSlug,
    },
  });

  redirect(
    `/client/store-setup/${storeId}?success=${encodeURIComponent(
      "Store setup updated successfully.",
    )}`,
  );
}