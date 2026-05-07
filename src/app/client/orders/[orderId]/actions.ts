"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OrderStatus =
  | "draft"
  | "created"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "returned";

type PaymentStatus = "unpaid" | "paid" | "partial" | "failed" | "refunded";

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

export async function updateOrderAction(formData: FormData) {
  const orderId = getRequiredValue(formData, "orderId");
  const orderStatus = getRequiredValue(formData, "orderStatus") as OrderStatus;
  const paymentStatus = getRequiredValue(
    formData,
    "paymentStatus",
  ) as PaymentStatus;
  const paymentMethod = getRequiredValue(
    formData,
    "paymentMethod",
  ) as PaymentMethod;

  const additionalPayment = parseNumber(
    getOptionalValue(formData, "additionalPayment"),
  );

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please login to update orders.");
  }

  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select(
      "id, business_id, store_id, total_amount, amount_paid, balance_amount",
    )
    .eq("id", orderId)
    .single();

  if (orderFetchError || !order) {
    redirect(
      `/client/orders/${orderId}?error=${encodeURIComponent(
        orderFetchError?.message || "Order not found.",
      )}`,
    );
  }

  const currentAmountPaid = Number(order.amount_paid || 0);
  const totalAmount = Number(order.total_amount || 0);
  const newAmountPaid = currentAmountPaid + additionalPayment;
  const newBalanceAmount = Math.max(totalAmount - newAmountPaid, 0);

  const finalPaymentStatus: PaymentStatus =
    additionalPayment > 0
      ? newAmountPaid >= totalAmount
        ? "paid"
        : "partial"
      : paymentStatus;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      order_status: orderStatus,
      payment_status: finalPaymentStatus,
      payment_method: paymentMethod,
      amount_paid: newAmountPaid,
      balance_amount: newBalanceAmount,
      delivery_address: getOptionalValue(formData, "deliveryAddress"),
      delivery_notes: getOptionalValue(formData, "deliveryNotes"),
      internal_notes: getOptionalValue(formData, "internalNotes"),
    })
    .eq("id", orderId);

  if (updateError) {
    redirect(
      `/client/orders/${orderId}?error=${encodeURIComponent(
        updateError.message,
      )}`,
    );
  }

  if (additionalPayment > 0) {
    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: order.business_id,
      store_id: order.store_id,
      order_id: order.id,
      payment_method: paymentMethod,
      payment_status: finalPaymentStatus === "paid" ? "paid" : "partial",
      amount: additionalPayment,
      transaction_reference: getOptionalValue(
        formData,
        "transactionReference",
      ),
      notes: getOptionalValue(formData, "paymentNotes"),
      collected_by: user.id,
    });

    if (paymentError) {
      redirect(
        `/client/orders/${orderId}?error=${encodeURIComponent(
          paymentError.message,
        )}`,
      );
    }
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: order.business_id,
    action: "order_updated",
    entity_type: "order",
    entity_id: order.id,
    description: `Order status updated to ${orderStatus}.`,
    metadata: {
      orderStatus,
      paymentStatus: finalPaymentStatus,
      additionalPayment,
      newAmountPaid,
      newBalanceAmount,
    },
  });

  redirect(
    `/client/orders/${orderId}?success=${encodeURIComponent(
      "Order updated successfully.",
    )}`,
  );
}