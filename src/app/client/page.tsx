import { redirect } from "next/navigation";

export default function OldClientRedirectPage() {
  redirect("/client/dashboard");
}