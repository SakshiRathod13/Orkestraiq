import { CreateEventPromptPage } from "@/components/create-event-prompt-page";

export default async function NewEventPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <CreateEventPromptPage orgId={orgId} />;
}
