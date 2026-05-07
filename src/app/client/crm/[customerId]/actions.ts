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

export async function updateCustomerAction(formData: FormData) {
  const customerId = getRequiredValue(formData, "customerId");

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to update customer details.");
  }

  const customerName = getRequiredValue(formData, "customerName");
  const phone = getRequiredValue(formData, "phone");
  const isActiveValue = getRequiredValue(formData, "isActive");

  const { data: customer, error: customerFetchError } = await supabase
    .from("customers")
    .select("id, business_id")
    .eq("id", customerId)
    .single();

  if (customerFetchError || !customer) {
    redirect(
      `/client/crm/${customerId}?error=${encodeURIComponent(
        customerFetchError?.message || "Customer not found.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("customers")
    .update({
      customer_name: customerName,
      phone,
      email: getOptionalValue(formData, "email"),
      address: getOptionalValue(formData, "address"),
      city: getOptionalValue(formData, "city"),
      state: getOptionalValue(formData, "state"),
      pincode: getOptionalValue(formData, "pincode"),
      notes: getOptionalValue(formData, "notes"),
      is_active: isActiveValue === "true",
    })
    .eq("id", customerId);

  if (error) {
    redirect(
      `/client/crm/${customerId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: customer.business_id,
    action: "customer_updated",
    entity_type: "customer",
    entity_id: customer.id,
    description: `Customer profile updated: ${customerName}.`,
    metadata: {
      phone,
      isActive: isActiveValue === "true",
    },
  });

  redirect(
    `/client/crm/${customerId}?success=${encodeURIComponent(
      "Customer profile updated successfully.",
    )}`,
  );
}