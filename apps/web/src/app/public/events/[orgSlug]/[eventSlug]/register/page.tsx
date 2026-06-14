import { PublicRegistrationPage } from "@/components/public-registration-page";

export default async function PublicRegisterPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
  const { orgSlug, eventSlug } = await params;
  return <PublicRegistrationPage orgSlug={orgSlug} eventSlug={eventSlug} />;
}
