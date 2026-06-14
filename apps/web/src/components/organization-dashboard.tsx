"use client";

import { CalendarDays, CheckCircle2, ClipboardList, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrganizations } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrganizationDashboard() {
  const organizations = useOrganizations();
  const organization = organizations.data?.[0];

  return (
    <AppShell>
      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">OpsPilot Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Orchestraiq</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Describe the event once. OpsPilot plans, creates, launches, promotes, manages,
              analyzes, and documents it.
            </p>
          </div>
          {organization ? (
            <Button asChild>
              <Link href={`/organizations/${organization.id}/events/new`}>
                <Sparkles className="h-4 w-4" />
                New event prompt
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 py-8">
        {organizations.isLoading ? <DashboardSkeleton /> : null}
        {organizations.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>API connection needed</CardTitle>
            </CardHeader>
            <CardContent>
              Start the API with <code>npm run dev -w @orchestraiq/api</code> and seed the database
              to load organization data.
            </CardContent>
          </Card>
        ) : null}
        {organization ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard icon={Users} label="Organization" value={organization.name} />
              <Link href={`/organizations/${organization.id}/events`}>
                <MetricCard icon={CalendarDays} label="Events" value={organization._count.events} />
              </Link>
              <MetricCard icon={CheckCircle2} label="Members" value={organization._count.members} />
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Foundation workspace</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{organization.description}</p>
                  </div>
                  <Badge>Milestone 2</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Multi-tenant organization model",
                    "Prompt-to-event brief intake",
                    "Progressive missing-field wizard",
                    "Approved event brief persistence"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-primary" />
      </CardContent>
    </Card>
  );
}
