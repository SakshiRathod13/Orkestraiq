import { EventDashboardPage } from "@/components/event-dashboard-page";

export default async function EventPage({ params }: { params: Promise<{ orgId: string; eventId: string }> }) {
  const { orgId, eventId } = await params;
  return <EventDashboardPage orgId={orgId} eventId={eventId} />;
}
