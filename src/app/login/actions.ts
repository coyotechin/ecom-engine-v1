"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AppRole =
  | "cyt_super_admin"
  | "cyt_executive"
  | "cyt_finance_admin"
  | "client_owner"
  | "store_manager"
  | "sales_staff"
  | "delivery_staff"
  | "customer";

function getRedirectPath(role: AppRole | null) {
  if (
    role === "cyt_super_admin" ||
    role === "cyt_executive" ||
    role === "cyt_finance_admin"
  ) {
    return "/admin";
  }

  if (
    role === "client_owner" ||
    role === "store_manager" ||
    role === "sales_staff" ||
    role === "delivery_staff"
  ) {
    return "/client";
  }

  return "/store/demo-store";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=Please enter both email and password");
  }

  const supabase = await createClient();

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    redirect(`/login?error=${encodeURIComponent(loginError.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Login failed. Please try again.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role || "customer") as AppRole;

  redirect(getRedirectPath(role));
}