export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const adminNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    description: "Overview of onboarding, tickets, customers, and revenue.",
  },
  {
    label: "Ticket Management",
    href: "/admin/tickets",
    description: "Create and manage onboarding tickets.",
  },
  {
    label: "Customer Onboarding",
    href: "/admin/onboarding",
    description: "Collect client business and launch details.",
  },
  {
    label: "Client Access",
    href: "/admin/access",
    description: "Create client, store manager, and staff access.",
  },
  {
    label: "Revenue Share",
    href: "/admin/revenue-share",
    description: "Configure and monitor revenue-share rules.",
  },
  {
    label: "CRM",
    href: "/admin/crm",
    description: "Manage leads, customers, follow-ups, and campaigns.",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    description: "View ticket, customer, revenue, and settlement reports.",
  },
];

export const clientNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/client",
  },
  {
    label: "Store Setup",
    href: "/client/store-setup",
  },
  {
    label: "Products",
    href: "/client/products",
  },
  {
    label: "Inventory",
    href: "/client/inventory",
  },
  {
    label: "POS",
    href: "/client/pos",
  },
  {
    label: "Orders",
    href: "/client/orders",
  },
  {
    label: "CRM",
    href: "/client/crm",
  },
  {
    label: "Reports",
    href: "/client/reports",
  },
  {
    label: "Settings",
    href: "/client/settings",
  },
];