"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type EngineType = "retail" | "learning" | "event";
type StaffRole = "Owner" | "Manager" | "Staff" | "Accountant";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function generateAccessCode() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `CYT-ACCESS-${timestamp}${random}`;
}

function generateUserId(engine: EngineType) {
  const prefix: Record<EngineType, string> = {
    retail: "RET",
    learning: "LRN",
    event: "EVT",
  };

  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);

  return `EEV1-${prefix[engine]}-${timestamp}${random}`;
}

function generateTemporaryPassword() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);

  return `CYT@${random}${timestamp}`;
}

function getEnginePermissions(engine: EngineType, role: StaffRole) {
  const commonPermissions = {
    dashboard: true,
    profile: true,
    reports: role === "Owner" || role === "Manager" || role === "Accountant",
    payments: role === "Owner" || role === "Manager" || role === "Accountant",
    activityLogs: role === "Owner" || role === "Manager",
  };

  const rolePermissions = {
    canManageUsers: role === "Owner",
    canManageSettings: role === "Owner" || role === "Manager",
    canExportReports: role === "Owner" || role === "Accountant",
  };

  if (engine === "retail") {
    return {
      engine,
      role,
      ...commonPermissions,
      ...rolePermissions,
      inventory: true,
      products: true,
      billing: true,
      orders: true,
      delivery: true,
      crm: true,
      campaigns: role !== "Staff",
    };
  }

  if (engine === "learning") {
    return {
      engine,
      role,
      ...commonPermissions,
      ...rolePermissions,
      programs: true,
      livePrograms: true,
      recordedPrograms: true,
      students: true,
      enrollments: true,
      crm: true,
      campaigns: role !== "Staff",
    };
  }

  return {
    engine,
    role,
    ...commonPermissions,
    ...rolePermissions,
    events: true,
    tickets: true,
    entries: true,
    attendees: true,
    checkIn: true,
    crm: true,
    campaigns: role !== "Staff",
  };
}

export async function createClientAccessAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/admin/cytnexus.com?error=${encodeURIComponent(
        "Please login as CYT Nexus admin to create client access.",
      )}`,
    );
  }

  const ticketId = getRequiredValue(formData, "ticketId");
  const ownerAdminName = getRequiredValue(formData, "ownerAdminName");
  const email = getRequiredValue(formData, "email");
  const phone = getRequiredValue(formData, "phone");
  const staffRole = getRequiredValue(formData, "staffRole") as StaffRole;

  const assignedDomain = getOptionalValue(formData, "assignedDomain");
  const assignedSubdomain = getOptionalValue(formData, "assignedSubdomain");
  const employeeName = getOptionalValue(formData, "employeeName");
  const credentialNotes = getOptionalValue(formData, "credentialNotes");

  const { data: ticket, error: ticketError } = await supabase
    .from("onboarding_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    redirect(
      `/admin/cytnexus.com/client-access?error=${encodeURIComponent(
        ticketError?.message || "Onboarding ticket not found.",
      )}`,
    );
  }

  const selectedEngine = ticket.selected_engine as EngineType;
  const businessName = String(ticket.business_name || "").trim();

  if (!businessName) {
    redirect(
      `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
        "Business name is missing in the selected ticket.",
      )}`,
    );
  }

  let businessId = ticket.converted_business_id as string | null;

  if (businessId) {
    const { error: businessUpdateError } = await supabase
      .from("businesses")
      .update({
        business_name: businessName,
        owner_name: ownerAdminName,
        phone,
        email,
        business_category: ticket.business_category,
        business_location: ticket.business_location,
        business_address: ticket.customer_address,
        engine_type: selectedEngine,
        onboarding_status: "access_created",
        assigned_executive_id: user.id,
        notes: ticket.internal_notes,
        is_active: true,
      })
      .eq("id", businessId);

    if (businessUpdateError) {
      redirect(
        `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
          businessUpdateError.message,
        )}`,
      );
    }
  } else {
    const { data: newBusiness, error: businessCreateError } = await supabase
      .from("businesses")
      .insert({
        business_name: businessName,
        owner_name: ownerAdminName,
        phone,
        email,
        business_category: ticket.business_category,
        business_location: ticket.business_location,
        business_address: ticket.customer_address,
        engine_type: selectedEngine,
        onboarding_status: "access_created",
        assigned_executive_id: user.id,
        notes: ticket.internal_notes,
        is_active: true,
      })
      .select("id")
      .single();

    if (businessCreateError || !newBusiness) {
      redirect(
        `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
          businessCreateError?.message || "Could not create business profile.",
        )}`,
      );
    }

    businessId = newBusiness.id;
  }

  const storeSlugBase = slugify(businessName);
  const storeSlug = `${storeSlugBase || "client-store"}-${Date.now()
    .toString()
    .slice(-4)}`;

  const { data: existingStore } = await supabase
    .from("stores")
    .select("id, store_slug")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let storeId = existingStore?.id as string | null;
  let finalStoreSlug = existingStore?.store_slug as string | null;

  if (!storeId) {
    const { data: newStore, error: storeCreateError } = await supabase
      .from("stores")
      .insert({
        business_id: businessId,
        store_name: businessName,
        store_slug: storeSlug,
        contact_number: phone,
        whatsapp_number: phone,
        email,
        business_address: ticket.customer_address,
        status: "draft",
        is_active: true,
      })
      .select("id, store_slug")
      .single();

    if (storeCreateError || !newStore) {
      redirect(
        `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
          storeCreateError?.message || "Could not create store reference.",
        )}`,
      );
    }

    storeId = newStore.id;
    finalStoreSlug = newStore.store_slug;
  }

  const accessCode = generateAccessCode();
  const clientUserId = generateUserId(selectedEngine);
  const temporaryPassword = generateTemporaryPassword();
  const permissions = getEnginePermissions(selectedEngine, staffRole);

  const backendAccessUrl =
    selectedEngine === "retail"
      ? "/client/retail"
      : selectedEngine === "learning"
        ? "/client/learning"
        : "/client/event";

  const finalAssignedSubdomain =
    assignedSubdomain || `${storeSlugBase || "client"}.ecom-engine-v1.vercel.app`;

  const { error: accessCreateError } = await supabase
    .from("client_access_accounts")
    .insert({
      onboarding_ticket_id: ticketId,
      business_id: businessId,
      store_id: storeId,

      access_code: accessCode,
      user_id: clientUserId,

      business_name: businessName,
      selected_engine: selectedEngine,

      owner_admin_name: ownerAdminName,
      email,
      phone,

      employee_name: employeeName,
      staff_role: staffRole,

      assigned_domain: assignedDomain,
      assigned_subdomain: finalAssignedSubdomain,

      access_permissions: permissions,

      account_status: "active",
      temporary_password: temporaryPassword,
      password_status: "temporary_generated",

      backend_access_url: backendAccessUrl,
      credential_notes: credentialNotes,

      created_by: user.id,
    });

  if (accessCreateError) {
    redirect(
      `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
        accessCreateError.message,
      )}`,
    );
  }

  const { error: ticketUpdateError } = await supabase
    .from("onboarding_tickets")
    .update({
      status: "access_created",
      client_access_status: "created",
      domain_status: "backend_prepared",
      converted_business_id: businessId,
      subdomain: finalAssignedSubdomain,
      custom_domain: assignedDomain,
      storefront_status: ticket.storefront_status || "manual_not_started",
      storefront_notes:
        ticket.storefront_notes ||
        "Backend/client portal access created. Custom storefront setup remains manual.",
    })
    .eq("id", ticketId);

  if (ticketUpdateError) {
    redirect(
      `/admin/cytnexus.com/client-access?ticketId=${ticketId}&error=${encodeURIComponent(
        ticketUpdateError.message,
      )}`,
    );
  }

  await supabase.from("activity_logs").insert({
    actor_profile_id: user.id,
    business_id: businessId,
    action: "client_access_created",
    entity_type: "client_access_account",
    entity_id: accessCode,
    description: `Client access created for ${businessName}.`,
    metadata: {
      ticketId,
      accessCode,
      userId: clientUserId,
      selectedEngine,
      staffRole,
      backendAccessUrl,
      assignedSubdomain: finalAssignedSubdomain,
    },
  });

  redirect(
    `/admin/cytnexus.com/client-access?ticketId=${ticketId}&success=${encodeURIComponent(
      `Client access created. User ID: ${clientUserId}. Temporary Password: ${temporaryPassword}`,
    )}`,
  );
}