import { PublicLandingPage } from "@/components/public-landing-page";

export default async function PublicEventPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
  const { orgSlug, eventSlug } = await params;
  return <PublicLandingPage orgSlug={orgSlug} eventSlug={eventSlug} />;
}
