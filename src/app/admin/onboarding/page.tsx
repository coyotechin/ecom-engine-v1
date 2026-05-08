import { redirect } from "next/navigation";

type OldAdminOnboardingRedirectPageProps = {
  searchParams: Promise<{
    ticketId?: string;
  }>;
};

export default async function OldAdminOnboardingRedirectPage({
  searchParams,
}: OldAdminOnboardingRedirectPageProps) {
  const { ticketId } = await searchParams;

  if (ticketId) {
    redirect(`/admin/cytnexus.com/onboarding?ticketId=${ticketId}`);
  }

  redirect("/admin/cytnexus.com/onboarding");
}