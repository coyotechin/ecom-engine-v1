"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CheckoutRequestStatus =
  | "pending"
  | "accepted"
  | "converted_to_order"
  | "rejected"
  | "cancelled";

type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "razorpay"
  | "cod"
  | "mixed"
  | "bank_transfer"
  | "other";

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

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `WEB-${timestamp}${random}`;
}

export async function updateCheckoutRequestAction(formData: FormData) {
  const requestId = getRequiredValue(formData, "requestId");
  const status = getRequiredValue(formData, "status") as CheckoutRequestStatus;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to update checkout requests.");
  }

  const { data: request, error: requestError } = await supabase
    .from("checkout_requests")
    .select("id, business_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        requestError?.message || "Checkout request not found.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("checkout_requests")
    .update({
      status,
      internal_notes: getOptionalValue(formData, "internalNotes"),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: request.business_id,
    action: "checkout_request_updated",
    entity_type: "checkout_request",
    entity_id: request.id,
    description: `Checkout request updated to ${status}.`,
    metadata: {
      status,
    },
  });

  redirect(
    `/client/checkout-requests/${requestId}?success=${encodeURIComponent(
      "Checkout request updated successfully.",
    )}`,
  );
}

export async function convertCheckoutRequestToOrderAction(formData: FormData) {
  const requestId = getRequiredValue(formData, "requestId");
  const paymentMethod = getRequiredValue(
    formData,
    "paymentMethod",
  ) as PaymentMethod;

  const amountPaid = parseNumber(getOptionalValue(formData, "amountPaid"));
  const deliveryCharge = parseNumber(getOptionalValue(formData, "deliveryCharge"));

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to convert checkout requests.");
  }

  const { data: request, error: requestError } = await supabase
    .from("checkout_requests")
    .select(
      "id, business_id, store_id, product_id, request_number, product_name, product_slug, sku, unit_price, quantity, subtotal_amount, discount_amount, tax_amount, total_amount, customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_pincode, customer_notes, preferred_payment_method, preferred_delivery_time, status, converted_order_id",
    )
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        requestError?.message || "Checkout request not found.",
      )}`,
    );
  }

  if (request.status === "converted_to_order" || request.converted_order_id) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        "This checkout request is already converted to an order.",
      )}`,
    );
  }

  if (request.status === "rejected" || request.status === "cancelled") {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        "Rejected or cancelled requests cannot be converted to orders.",
      )}`,
    );
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("id, available_stock, damaged_stock, low_stock_alert")
    .eq("product_id", request.product_id)
    .maybeSingle();

  if (inventoryError || !inventory) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        inventoryError?.message || "Inventory record not found for this product.",
      )}`,
    );
  }

  const availableStock = Number(inventory.available_stock || 0);
  const quantity = Number(request.quantity || 0);

  if (quantity <= 0) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        "Request quantity is invalid.",
      )}`,
    );
  }

  if (quantity > availableStock) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        `Only ${availableStock} units available in stock.`,
      )}`,
    );
  }

  const totalAmount =
    Number(request.subtotal_amount || 0) -
    Number(request.discount_amount || 0) +
    Number(request.tax_amount || 0) +
    deliveryCharge;

  const safeTotalAmount = Math.max(totalAmount, 0);
  const balanceAmount = Math.max(safeTotalAmount - amountPaid, 0);

  const paymentStatus =
    amountPaid <= 0
      ? "unpaid"
      : amountPaid >= safeTotalAmount
        ? "paid"
        : "partial";

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id, total_orders, total_spent")
    .eq("business_id", request.business_id)
    .eq("phone", request.customer_phone)
    .maybeSingle();

  let customerId: string | null = null;

  if (existingCustomer) {
    customerId = existingCustomer.id;

    await supabase
      .from("customers")
      .update({
        customer_name: request.customer_name,
        email: request.customer_email,
        address: request.delivery_address,
        city: request.delivery_city,
        pincode: request.delivery_pincode,
        notes: request.customer_notes,
        total_orders: Number(existingCustomer.total_orders || 0) + 1,
        total_spent: Number(existingCustomer.total_spent || 0) + safeTotalAmount,
        last_order_at: new Date().toISOString(),
        is_active: true,
      })
      .eq("id", existingCustomer.id);
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        business_id: request.business_id,
        store_id: request.store_id,
        customer_name: request.customer_name,
        phone: request.customer_phone,
        email: request.customer_email,
        address: request.delivery_address,
        city: request.delivery_city,
        pincode: request.delivery_pincode,
        notes: request.customer_notes,
        total_orders: 1,
        total_spent: safeTotalAmount,
        last_order_at: new Date().toISOString(),
        is_active: true,
      })
      .select("id")
      .single();

    if (customerError || !newCustomer) {
      redirect(
        `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
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
      business_id: request.business_id,
      store_id: request.store_id,
      customer_id: customerId,
      order_number: orderNumber,
      order_channel: "online_store",
      order_status: "confirmed",
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      subtotal_amount: request.subtotal_amount,
      discount_amount: request.discount_amount,
      tax_amount: request.tax_amount,
      delivery_charge: deliveryCharge,
      total_amount: safeTotalAmount,
      amount_paid: amountPaid,
      balance_amount: balanceAmount,
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      customer_email: request.customer_email,
      billing_address: request.delivery_address,
      delivery_address: request.delivery_address,
      delivery_notes: request.customer_notes,
      internal_notes: getOptionalValue(formData, "internalNotes"),
      invoice_number: orderNumber,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        orderError?.message || "Could not create order.",
      )}`,
    );
  }

  const { error: orderItemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    business_id: request.business_id,
    store_id: request.store_id,
    product_id: request.product_id,
    variant_id: null,
    product_name: request.product_name,
    sku: request.sku,
    quantity,
    unit_price: request.unit_price,
    discount_percentage: 0,
    discount_amount: request.discount_amount,
    tax_percentage: 0,
    tax_amount: request.tax_amount,
    line_total: safeTotalAmount,
  });

  if (orderItemError) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        orderItemError.message,
      )}`,
    );
  }

  if (amountPaid > 0) {
    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: request.business_id,
      store_id: request.store_id,
      order_id: order.id,
      payment_method: paymentMethod,
      payment_status: paymentStatus === "paid" ? "paid" : "partial",
      amount: amountPaid,
      transaction_reference: getOptionalValue(
        formData,
        "transactionReference",
      ),
      notes: getOptionalValue(formData, "paymentNotes"),
      collected_by: user.id,
    });

    if (paymentError) {
      redirect(
        `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
          paymentError.message,
        )}`,
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
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        inventoryUpdateError.message,
      )}`,
    );
  }

  const { error: inventoryLogError } = await supabase
    .from("inventory_logs")
    .insert({
      business_id: request.business_id,
      store_id: request.store_id,
      product_id: request.product_id,
      variant_id: null,
      movement_type: "online_order",
      quantity,
      previous_stock: availableStock,
      new_stock: newStock,
      reference_type: "checkout_request_conversion",
      reference_id: order.id,
      notes: `Stock reduced after converting checkout request ${request.request_number} to order ${orderNumber}.`,
      created_by: user.id,
    });

  if (inventoryLogError) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        inventoryLogError.message,
      )}`,
    );
  }

  const { data: revenueRule } = await supabase
    .from("revenue_share_rules")
    .select("id, revenue_share_percentage")
    .eq("business_id", request.business_id)
    .eq("is_active", true)
    .maybeSingle();

  const revenueSharePercentage = Number(
    revenueRule?.revenue_share_percentage || 0,
  );
  const cytShareAmount = safeTotalAmount * (revenueSharePercentage / 100);
  const clientShareAmount = safeTotalAmount - cytShareAmount;

  await supabase.from("revenue_share_entries").insert({
    business_id: request.business_id,
    order_id: order.id,
    revenue_share_rule_id: revenueRule?.id || null,
    gross_order_amount: safeTotalAmount,
    net_revenue_amount: safeTotalAmount,
    revenue_share_percentage: revenueSharePercentage,
    cyt_share_amount: cytShareAmount,
    client_share_amount: clientShareAmount,
    settlement_status: "pending",
    notes: `Revenue-share entry created after checkout request ${request.request_number} conversion.`,
  });

  const { error: requestUpdateError } = await supabase
    .from("checkout_requests")
    .update({
      status: "converted_to_order",
      converted_order_id: order.id,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      internal_notes: getOptionalValue(formData, "internalNotes"),
      delivery_charge: deliveryCharge,
      total_amount: safeTotalAmount,
    })
    .eq("id", requestId);

  if (requestUpdateError) {
    redirect(
      `/client/checkout-requests/${requestId}?error=${encodeURIComponent(
        requestUpdateError.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: request.business_id,
    action: "checkout_request_converted_to_order",
    entity_type: "checkout_request",
    entity_id: request.id,
    description: `Checkout request ${request.request_number} converted to order ${orderNumber}.`,
    metadata: {
      requestNumber: request.request_number,
      orderNumber,
      totalAmount: safeTotalAmount,
      quantity,
    },
  });

  redirect(
    `/client/orders/${order.id}?success=${encodeURIComponent(
      `Checkout request converted to order ${orderNumber}.`,
    )}`,
  );
}