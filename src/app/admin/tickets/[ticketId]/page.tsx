import { redirect } from "next/navigation";

type OldTicketDetailRedirectPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function OldTicketDetailRedirectPage({
  params,
}: OldTicketDetailRedirectPageProps) {
  const { ticketId } = await params;

  redirect(`/admin/cytnexus.com/tickets/${ticketId}`);
}