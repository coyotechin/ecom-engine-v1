import { redirect } from "next/navigation";

export default function OldAdminTicketsRedirectPage() {
  redirect("/admin/cytnexus.com/tickets");
}