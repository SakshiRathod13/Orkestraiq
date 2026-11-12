"use client";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Megaphone,
  Sparkles,
  Users
} from "lucide-react";
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
      <section className="motion-enter overflow-hidden rounded-lg border border-slate-800 bg-[hsl(222_38%_12%)] text-white shadow-[0_18px_38px_hsl(222_38%_12%_/_0.16)]">
        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              <span className="agent-orb relative h-2 w-2 rounded-full bg-emerald-400" />
              OpsPilot command center
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">Run events with an agent team.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Describe the event once. OpsPilot plans, creates, launches, promotes, manages,
              analyzes, and documents it.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Workflow capacity</span>
              <span className="font-semibold text-white">Ready</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="agent-progress relative h-full w-full" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Start with a prompt. Human approval remains required before launch.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-6 sm:py-8">
        {organizations.isLoading ? <DashboardSkeleton /> : null}
        {organizations.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>API connection needed</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/login" className="font-medium text-primary underline">Sign in or create an account</Link> after starting the API and database.
            </CardContent>
          </Card>
        ) : null}
        {organization ? (
          <>
            <div className="motion-enter motion-delay-1 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-[0_1px_2px_hsl(222_30%_15%_/_0.04)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{organization.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{organization.description || "Your organization workspace is ready for its first event."}</p>
              </div>
              <Button asChild className="w-full shrink-0 sm:w-auto">
                <Link href={`/organizations/${organization.id}/events/new`}>
                  <Sparkles className="h-4 w-4" />
                  Create event from prompt
                </Link>
              </Button>
            </div>

            <div className="motion-enter motion-delay-2 grid gap-4 sm:grid-cols-3">
              <MetricCard icon={Users} label="Organization" value={organization.name} accent="emerald" />
              <Link href={`/organizations/${organization.id}/events`} className="block">
                <MetricCard icon={CalendarDays} label="Active events" value={organization._count.events} accent="blue" />
              </Link>
              <MetricCard icon={CheckCircle2} label="Team members" value={organization._count.members} accent="amber" />
            </div>

            <div className="motion-enter motion-delay-3 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Orchestration flow</p>
                    <CardTitle className="mt-2">Take an idea to launch</CardTitle>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700">Approval-led</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <WorkflowStage number="01" title="Describe" detail="Turn a natural-language idea into an event brief." href={`/organizations/${organization.id}/events/new`} icon={Sparkles} state="Start here" />
                    <WorkflowStage number="02" title="Plan" detail="Review the AI-generated format, audience, schedule, and goals." href={`/organizations/${organization.id}/events`} icon={ClipboardList} state="Approval gate" />
                    <WorkflowStage number="03" title="Build assets" detail="Generate the page, form, marketing drafts, and meeting details." href="/workspace/templates" icon={FileText} state="Agent-assisted" />
                    <WorkflowStage number="04" title="Launch" detail="Publish only after your team approves the final output." href="/workspace/campaigns" icon={Megaphone} state="Human control" />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border bg-[hsl(216_24%_97%)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agent activity</p>
                      <CardTitle className="mt-2">Workflow readiness</CardTitle>
                    </div>
                    <Activity className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <AgentStatus name="COO Agent" detail="Coordinates approvals" status="Ready" />
                  <AgentStatus name="Event Planner" detail="Waiting for an event prompt" status="Standby" />
                  <AgentStatus name="Asset Studio" detail="Creates pages, forms, and campaigns" status="Standby" />
                  <Link href="/workspace/agent-runs" className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-muted">
                    Open agent command center <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
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
  value,
  accent
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  accent: "emerald" | "blue" | "amber";
}) {
  const accentStyles = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700"
  }[accent];

  return (
    <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-md ${accentStyles}`}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function WorkflowStage({
  number,
  title,
  detail,
  href,
  icon: Icon,
  state
}: {
  number: string;
  title: string;
  detail: string;
  href: string;
  icon: typeof Sparkles;
  state: string;
}) {
  return (
    <Link href={href} className="group rounded-md border border-border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">{number}</span>
        <Icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
      </div>
      <p className="mt-5 font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
      <span className="mt-4 inline-flex rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{state}</span>
    </Link>
  );
}

function AgentStatus({ name, detail, status }: { name: string; detail: string; status: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-2 w-2 shrink-0 rounded-full ${status === "Ready" ? "bg-emerald-500" : "bg-amber-400"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{status}</span>
    </div>
  );
}
