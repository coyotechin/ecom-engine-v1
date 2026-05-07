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

function parseInteger(value: string) {
  const parsedValue = Number(value.replace(/[^\d-]/g, ""));
  return Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 0;
}

function generateRequestNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `REQ-${timestamp}${random}`;
}

export async function createCheckoutRequestAction(formData: FormData) {
  const storeSlug = getRequiredValue(formData, "storeSlug");
  const productSlug = getRequiredValue(formData, "productSlug");

  const customerName = getRequiredValue(formData, "customerName");
  const customerPhone = getRequiredValue(formData, "customerPhone");
  const deliveryAddress = getRequiredValue(formData, "deliveryAddress");
  const quantity = parseInteger(getRequiredValue(formData, "quantity"));

  if (quantity <= 0) {
    redirect(
      `/store/${storeSlug}/products/${productSlug}/checkout?error=${encodeURIComponent(
        "Quantity must be greater than zero.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, business_id, store_name, store_slug, status, is_active")
    .eq("store_slug", storeSlug)
    .eq("status", "live")
    .eq("is_active", true)
    .single();

  if (storeError || !store) {
    redirect(
      `/store/${storeSlug}/products/${productSlug}/checkout?error=${encodeURIComponent(
        "Store is not available for checkout.",
      )}`,
    );
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "id, business_id, store_id, product_name, product_slug, sku, price, tax_percentage, discount_percentage, status, is_active, is_online_visible",
    )
    .eq("store_id", store.id)
    .eq("product_slug", productSlug)
    .eq("status", "active")
    .eq("is_active", true)
    .eq("is_online_visible", true)
    .single();

  if (productError || !product) {
    redirect(
      `/store/${storeSlug}/products/${productSlug}/checkout?error=${encodeURIComponent(
        "Product is not available for checkout.",
      )}`,
    );
  }

  const { data: inventory } = await supabase
    .from("inventory")
    .select("available_stock")
    .eq("product_id", product.id)
    .maybeSingle();

  const availableStock = Number(inventory?.available_stock || 0);

  if (quantity > availableStock) {
    redirect(
      `/store/${storeSlug}/products/${productSlug}/checkout?error=${encodeURIComponent(
        `Only ${availableStock} units available.`,
      )}`,
    );
  }

  const unitPrice = Number(product.price || 0);
  const subtotalAmount = unitPrice * quantity;
  const discountAmount =
    subtotalAmount * (Number(product.discount_percentage || 0) / 100);
  const taxableAmount = Math.max(subtotalAmount - discountAmount, 0);
  const taxAmount = taxableAmount * (Number(product.tax_percentage || 0) / 100);
  const totalAmount = Math.max(taxableAmount + taxAmount, 0);

  const requestNumber = generateRequestNumber();

  const { error } = await supabase.from("checkout_requests").insert({
    business_id: store.business_id,
    store_id: store.id,
    product_id: product.id,
    request_number: requestNumber,
    product_name: product.product_name,
    product_slug: product.product_slug,
    sku: product.sku,
    unit_price: unitPrice,
    quantity,
    subtotal_amount: subtotalAmount,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    delivery_charge: 0,
    total_amount: totalAmount,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: getOptionalValue(formData, "customerEmail"),
    delivery_address: deliveryAddress,
    delivery_city: getOptionalValue(formData, "deliveryCity"),
    delivery_pincode: getOptionalValue(formData, "deliveryPincode"),
    customer_notes: getOptionalValue(formData, "customerNotes"),
    preferred_payment_method: getOptionalValue(
      formData,
      "preferredPaymentMethod",
    ),
    preferred_delivery_time: getOptionalValue(
      formData,
      "preferredDeliveryTime",
    ),
    status: "pending",
  });

  if (error) {
    redirect(
      `/store/${storeSlug}/products/${productSlug}/checkout?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(
    `/store/${storeSlug}/products/${productSlug}/checkout?success=${encodeURIComponent(
      `Checkout request ${requestNumber} submitted successfully.`,
    )}`,
  );
}