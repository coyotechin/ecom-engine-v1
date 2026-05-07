"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type StockMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "damaged"
  | "return"
  | "pos_sale"
  | "online_order";

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

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.trunc(parsedValue);
}

function calculateNewStock({
  movementType,
  currentAvailableStock,
  currentDamagedStock,
  quantity,
}: {
  movementType: StockMovementType;
  currentAvailableStock: number;
  currentDamagedStock: number;
  quantity: number;
}) {
  let newAvailableStock = currentAvailableStock;
  let newDamagedStock = currentDamagedStock;

  if (movementType === "stock_in" || movementType === "return") {
    newAvailableStock = currentAvailableStock + Math.abs(quantity);
  }

  if (
    movementType === "stock_out" ||
    movementType === "pos_sale" ||
    movementType === "online_order"
  ) {
    newAvailableStock = currentAvailableStock - Math.abs(quantity);
  }

  if (movementType === "damaged") {
    newAvailableStock = currentAvailableStock - Math.abs(quantity);
    newDamagedStock = currentDamagedStock + Math.abs(quantity);
  }

  if (movementType === "adjustment") {
    newAvailableStock = currentAvailableStock + quantity;
  }

  return {
    newAvailableStock,
    newDamagedStock,
  };
}

export async function updateInventoryStockAction(formData: FormData) {
  const inventoryId = getRequiredValue(formData, "inventoryId");
  const movementType = getRequiredValue(
    formData,
    "movementType",
  ) as StockMovementType;
  const quantity = parseInteger(getRequiredValue(formData, "quantity"));
  const notes = getOptionalValue(formData, "notes");

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to manage inventory.");
  }

  if (quantity === 0) {
    redirect(
      `/client/inventory/${inventoryId}?error=${encodeURIComponent(
        "Quantity cannot be zero.",
      )}`,
    );
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select(
      "id, business_id, store_id, product_id, variant_id, available_stock, damaged_stock",
    )
    .eq("id", inventoryId)
    .single();

  if (inventoryError || !inventory) {
    redirect(
      `/client/inventory/${inventoryId}?error=${encodeURIComponent(
        inventoryError?.message || "Inventory record not found.",
      )}`,
    );
  }

  const previousStock = inventory.available_stock || 0;
  const previousDamagedStock = inventory.damaged_stock || 0;

  const { newAvailableStock, newDamagedStock } = calculateNewStock({
    movementType,
    currentAvailableStock: previousStock,
    currentDamagedStock: previousDamagedStock,
    quantity,
  });

  if (newAvailableStock < 0) {
    redirect(
      `/client/inventory/${inventoryId}?error=${encodeURIComponent(
        "Available stock cannot go below zero.",
      )}`,
    );
  }

  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      available_stock: newAvailableStock,
      damaged_stock: newDamagedStock,
      last_stock_update_at: new Date().toISOString(),
    })
    .eq("id", inventoryId);

  if (updateError) {
    redirect(
      `/client/inventory/${inventoryId}?error=${encodeURIComponent(
        updateError.message,
      )}`,
    );
  }

  const { error: logError } = await supabase.from("inventory_logs").insert({
    business_id: inventory.business_id,
    store_id: inventory.store_id,
    product_id: inventory.product_id,
    variant_id: inventory.variant_id,
    movement_type: movementType,
    quantity,
    previous_stock: previousStock,
    new_stock: newAvailableStock,
    reference_type: "manual_inventory_update",
    reference_id: inventory.id,
    notes,
    created_by: user.id,
  });

  if (logError) {
    redirect(
      `/client/inventory/${inventoryId}?error=${encodeURIComponent(
        logError.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: inventory.business_id,
    action: "inventory_stock_updated",
    entity_type: "inventory",
    entity_id: inventory.id,
    description: `Inventory stock updated with movement type ${movementType}.`,
    metadata: {
      movementType,
      quantity,
      previousStock,
      newAvailableStock,
    },
  });

  redirect(
    `/client/inventory/${inventoryId}?success=${encodeURIComponent(
      "Inventory stock updated successfully.",
    )}`,
  );
}