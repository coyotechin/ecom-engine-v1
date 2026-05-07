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
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function parseInteger(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value.replace(/[^\d-]/g, ""));
  return Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 0;
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `POS-${timestamp}${random}`;
}

export async function createPosOrderAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to create POS bills.");
  }

  const inventoryId = getRequiredValue(formData, "inventoryId");
  const customerName = getRequiredValue(formData, "customerName");
  const customerPhone = getRequiredValue(formData, "customerPhone");
  const quantity = parseInteger(getRequiredValue(formData, "quantity"));
  const paymentMethod = getRequiredValue(formData, "paymentMethod");

  const customerEmail = getOptionalValue(formData, "customerEmail");
  const customerAddress = getOptionalValue(formData, "customerAddress");
  const deliveryCharge = parseNumber(getOptionalValue(formData, "deliveryCharge"));
  const manualDiscountAmount = parseNumber(
    getOptionalValue(formData, "manualDiscountAmount"),
  );
  const amountPaid = parseNumber(getOptionalValue(formData, "amountPaid"));
  const internalNotes = getOptionalValue(formData, "internalNotes");

  if (quantity <= 0) {
    redirect(
      `/client/pos?error=${encodeURIComponent(
        "Quantity must be greater than zero.",
      )}`,
    );
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select(
      "id, business_id, store_id, product_id, available_stock, products(product_name, sku, price, tax_percentage, discount_percentage)",
    )
    .eq("id", inventoryId)
    .single();

  if (inventoryError || !inventory) {
    redirect(
      `/client/pos?error=${encodeURIComponent(
        inventoryError?.message || "Inventory item not found.",
      )}`,
    );
  }

  const product = Array.isArray(inventory.products)
    ? inventory.products[0]
    : inventory.products;

  if (!product) {
    redirect(
      `/client/pos?error=${encodeURIComponent(
        "Connected product was not found for this inventory item.",
      )}`,
    );
  }

  const availableStock = inventory.available_stock || 0;

  if (quantity > availableStock) {
    redirect(
      `/client/pos?error=${encodeURIComponent(
        `Only ${availableStock} units available in stock.`,
      )}`,
    );
  }

  const unitPrice = Number(product.price || 0);
  const taxPercentage = Number(product.tax_percentage || 0);
  const productDiscountPercentage = Number(product.discount_percentage || 0);

  const subtotalAmount = unitPrice * quantity;
  const productDiscountAmount =
    subtotalAmount * (productDiscountPercentage / 100);
  const discountAmount = productDiscountAmount + manualDiscountAmount;
  const taxableAmount = Math.max(subtotalAmount - discountAmount, 0);
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const totalAmount = Math.max(taxableAmount + taxAmount + deliveryCharge, 0);
  const balanceAmount = Math.max(totalAmount - amountPaid, 0);

  const paymentStatus =
    amountPaid <= 0 ? "unpaid" : amountPaid >= totalAmount ? "paid" : "partial";

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id, total_orders, total_spent")
    .eq("business_id", inventory.business_id)
    .eq("phone", customerPhone)
    .maybeSingle();

  let customerId: string | null = null;

  if (existingCustomer) {
    customerId = existingCustomer.id;

    await supabase
      .from("customers")
      .update({
        customer_name: customerName,
        email: customerEmail,
        address: customerAddress,
        total_orders: (existingCustomer.total_orders || 0) + 1,
        total_spent: Number(existingCustomer.total_spent || 0) + totalAmount,
        last_order_at: new Date().toISOString(),
      })
      .eq("id", existingCustomer.id);
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        business_id: inventory.business_id,
        store_id: inventory.store_id,
        customer_name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        total_orders: 1,
        total_spent: totalAmount,
        last_order_at: new Date().toISOString(),
        is_active: true,
      })
      .select("id")
      .single();

    if (customerError || !newCustomer) {
      redirect(
        `/client/pos?error=${encodeURIComponent(
          customerError?.message || "Could not create customer record.",
        )}`,
      );
    }

    customerId = newCustomer.id;
  }

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: inventory.business_id,
      store_id: inventory.store_id,
      customer_id: customerId,
      order_number: orderNumber,
      order_channel: "offline_pos",
      order_status: "created",
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      balance_amount: balanceAmount,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      billing_address: customerAddress,
      internal_notes: internalNotes,
      invoice_number: orderNumber,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    redirect(
      `/client/pos?error=${encodeURIComponent(
        orderError?.message || "Could not create POS order.",
      )}`,
    );
  }

  const lineTotal = totalAmount;

  const { error: orderItemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    business_id: inventory.business_id,
    store_id: inventory.store_id,
    product_id: inventory.product_id,
    variant_id: null,
    product_name: product.product_name,
    sku: product.sku,
    quantity,
    unit_price: unitPrice,
    discount_percentage: productDiscountPercentage,
    discount_amount: discountAmount,
    tax_percentage: taxPercentage,
    tax_amount: taxAmount,
    line_total: lineTotal,
  });

  if (orderItemError) {
    redirect(
      `/client/pos?error=${encodeURIComponent(orderItemError.message)}`,
    );
  }

  if (amountPaid > 0) {
    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: inventory.business_id,
      store_id: inventory.store_id,
      order_id: order.id,
      payment_method: paymentMethod,
      payment_status: paymentStatus === "paid" ? "paid" : "partial",
      amount: amountPaid,
      transaction_reference: getOptionalValue(formData, "transactionReference"),
      notes: internalNotes,
      collected_by: user.id,
    });

    if (paymentError) {
      redirect(
        `/client/pos?error=${encodeURIComponent(paymentError.message)}`,
      );
    }
  }

  const newStock = availableStock - quantity;

  const { error: inventoryUpdateError } = await supabase
    .from("inventory")
    .update({
      available_stock: newStock,
      last_stock_update_at: new Date().toISOString(),
    })
    .eq("id", inventory.id);

  if (inventoryUpdateError) {
    redirect(
      `/client/pos?error=${encodeURIComponent(inventoryUpdateError.message)}`,
    );
  }

  const { error: inventoryLogError } = await supabase
    .from("inventory_logs")
    .insert({
      business_id: inventory.business_id,
      store_id: inventory.store_id,
      product_id: inventory.product_id,
      variant_id: null,
      movement_type: "pos_sale",
      quantity,
      previous_stock: availableStock,
      new_stock: newStock,
      reference_type: "pos_order",
      reference_id: order.id,
      notes: `Stock reduced for POS order ${orderNumber}.`,
      created_by: user.id,
    });

  if (inventoryLogError) {
    redirect(
      `/client/pos?error=${encodeURIComponent(inventoryLogError.message)}`,
    );
  }

  const { data: revenueRule } = await supabase
    .from("revenue_share_rules")
    .select("id, revenue_share_percentage")
    .eq("business_id", inventory.business_id)
    .eq("is_active", true)
    .maybeSingle();

  const revenueSharePercentage = Number(
    revenueRule?.revenue_share_percentage || 0,
  );
  const cytShareAmount = totalAmount * (revenueSharePercentage / 100);
  const clientShareAmount = totalAmount - cytShareAmount;

  await supabase.from("revenue_share_entries").insert({
    business_id: inventory.business_id,
    order_id: order.id,
    revenue_share_rule_id: revenueRule?.id || null,
    gross_order_amount: totalAmount,
    net_revenue_amount: totalAmount,
    revenue_share_percentage: revenueSharePercentage,
    cyt_share_amount: cytShareAmount,
    client_share_amount: clientShareAmount,
    settlement_status: "pending",
    notes: `Revenue-share entry created for POS order ${orderNumber}.`,
  });

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: inventory.business_id,
    action: "pos_order_created",
    entity_type: "order",
    entity_id: order.id,
    description: `POS order created: ${orderNumber}.`,
    metadata: {
      orderNumber,
      totalAmount,
      paymentStatus,
      quantity,
      productName: product.product_name,
    },
  });

  redirect(
    `/client/pos?success=${encodeURIComponent(
      `POS order ${orderNumber} created successfully.`,
    )}`,
  );
}