import { EventListPage } from "@/components/event-list-page";

export default async function EventsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <EventListPage orgId={orgId} />;
}
