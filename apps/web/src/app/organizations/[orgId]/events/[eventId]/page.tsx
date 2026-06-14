import { EventBriefPage } from "@/components/event-brief-page";

export default async function EventPage({ params }: { params: Promise<{ orgId: string; eventId: string }> }) {
  const { orgId, eventId } = await params;
  return <EventBriefPage orgId={orgId} eventId={eventId} />;
}
