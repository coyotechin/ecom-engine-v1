import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ecom Engine v.1 | CYT Nexus",
    template: "%s | Ecom Engine v.1",
  },
  description:
    "Ecom Engine v.1 by CYT Nexus is a ready-to-onboard commerce operations engine for ecommerce, inventory, POS, CRM, storefronts, reports, and revenue-sharing operations.",
  keywords: [
    "Ecom Engine v.1",
    "CYT Nexus",
    "commerce operations engine",
    "ecommerce platform",
    "inventory management",
    "POS billing",
    "CRM",
    "store management",
    "revenue sharing ecommerce",
    "business onboarding platform",
  ],
  authors: [{ name: "CYT Nexus" }],
  creator: "CYT Nexus",
  publisher: "CYT Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}