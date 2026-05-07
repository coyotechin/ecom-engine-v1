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

function parseNumber(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[₹,%\s]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function parseInteger(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[^\d-]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to create products.");
  }

  const businessId = getRequiredValue(formData, "businessId");
  const storeId = getOptionalValue(formData, "storeId");
  const productName = getRequiredValue(formData, "productName");
  const rawProductSlug =
    getOptionalValue(formData, "productSlug") || productName;
  const productSlug = createSafeSlug(rawProductSlug);

  if (!productSlug) {
    redirect(
      `/client/products/create?error=${encodeURIComponent(
        "Product slug is invalid. Use letters, numbers, and simple words.",
      )}`,
    );
  }

  const price = parseNumber(getRequiredValue(formData, "price"));
  const compareAtPrice = parseNumber(getOptionalValue(formData, "compareAtPrice"));
  const costPrice = parseNumber(getOptionalValue(formData, "costPrice"));
  const taxPercentage = parseNumber(getOptionalValue(formData, "taxPercentage"));
  const discountPercentage = parseNumber(
    getOptionalValue(formData, "discountPercentage"),
  );
  const initialStock = parseInteger(getOptionalValue(formData, "initialStock"));
  const lowStockAlert = parseInteger(getOptionalValue(formData, "lowStockAlert")) || 5;

  const categoryName = getOptionalValue(formData, "categoryName");
  let categoryId: string | null = null;

  if (categoryName) {
    const categorySlug = createSafeSlug(categoryName);

    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("business_id", businessId)
      .eq("slug", categorySlug)
      .maybeSingle();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from("categories")
        .insert({
          business_id: businessId,
          store_id: storeId,
          name: categoryName,
          slug: categorySlug,
          description: null,
          is_active: true,
        })
        .select("id")
        .single();

      if (categoryError || !newCategory) {
        redirect(
          `/client/products/create?error=${encodeURIComponent(
            categoryError?.message || "Could not create product category.",
          )}`,
        );
      }

      categoryId = newCategory.id;
    }
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      business_id: businessId,
      store_id: storeId,
      category_id: categoryId,
      product_name: productName,
      product_slug: productSlug,
      sku: getOptionalValue(formData, "sku"),
      barcode: getOptionalValue(formData, "barcode"),
      short_description: getOptionalValue(formData, "shortDescription"),
      description: getOptionalValue(formData, "description"),
      price,
      compare_at_price: compareAtPrice || null,
      cost_price: costPrice || null,
      tax_percentage: taxPercentage,
      discount_percentage: discountPercentage,
      main_image_url: getOptionalValue(formData, "mainImageUrl"),
      status: getRequiredValue(formData, "status"),
      is_online_visible: formData.get("isOnlineVisible") === "on",
      is_featured: formData.get("isFeatured") === "on",
      is_active: true,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (productError || !product) {
    redirect(
      `/client/products/create?error=${encodeURIComponent(
        productError?.message || "Could not create product.",
      )}`,
    );
  }

  const { error: inventoryError } = await supabase.from("inventory").insert({
    business_id: businessId,
    store_id: storeId,
    product_id: product.id,
    variant_id: null,
    available_stock: initialStock,
    reserved_stock: 0,
    damaged_stock: 0,
    low_stock_alert: lowStockAlert,
    last_stock_update_at: new Date().toISOString(),
  });

  if (inventoryError) {
    redirect(
      `/client/products/create?error=${encodeURIComponent(
        inventoryError.message,
      )}`,
    );
  }

  if (initialStock !== 0) {
    await supabase.from("inventory_logs").insert({
      business_id: businessId,
      store_id: storeId,
      product_id: product.id,
      variant_id: null,
      movement_type: "stock_in",
      quantity: initialStock,
      previous_stock: 0,
      new_stock: initialStock,
      reference_type: "product_creation",
      reference_id: product.id,
      notes: "Initial stock added during product creation.",
      created_by: user.id,
    });
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: businessId,
    action: "product_created",
    entity_type: "product",
    entity_id: product.id,
    description: `Product created: ${productName}.`,
    metadata: {
      productSlug,
      initialStock,
    },
  });

  redirect(
    `/client/products?success=${encodeURIComponent(
      "Product created successfully.",
    )}`,
  );
}