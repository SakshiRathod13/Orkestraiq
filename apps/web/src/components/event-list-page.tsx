"use client";

import { CalendarDays, Plus, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization, useOrganizationEvents } from "@/lib/api";

export function EventListPage({ orgId }: { orgId: string }) {
  const organization = useOrganization(orgId);
  const events = useOrganizationEvents(orgId);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{organization.data?.name ?? "Organization"}</p>
          <h1 className="mt-1 text-2xl font-semibold">Events</h1>
        </div>
        <Button asChild>
          <Link href={`/organizations/${orgId}/events/new`}>
            <Plus className="h-4 w-4" />
            Create from prompt
          </Link>
        </Button>
      </div>

      {events.isLoading ? <div className="h-32 animate-pulse rounded-lg bg-muted" /> : null}
      {events.isError ? <Card><CardContent className="p-5">Unable to load events. Start the API and seed data.</CardContent></Card> : null}

      <div className="grid gap-4">
        {events.data?.map((event) => (
          <Link key={event.id} href={`/organizations/${orgId}/events/${event.id}`}>
            <Card className="transition hover:border-primary">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{event.objective ?? event.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{event.type.replace(/_/g, " ")}</Badge>
                    <Badge>{event.brief?.status ?? event.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <span className="flex items-center gap-2"><Users className="h-4 w-4" />{event.audience ?? "Audience TBD"}</span>
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{event.brief?.dateTimeText ?? "Date TBD"}</span>
                <span>{event.capacity ? `${event.capacity} target attendees` : "Capacity TBD"}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
