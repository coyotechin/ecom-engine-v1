import { redirect } from "next/navigation";

export default function OldCreateTicketRedirectPage() {
  redirect("/admin/cytnexus.com/tickets/create");
}