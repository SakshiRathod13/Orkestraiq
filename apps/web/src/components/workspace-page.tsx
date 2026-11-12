"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CreditCard,
  FileText,
  Layers3,
  Megaphone,
  PlugZap,
  Plus,
  Settings2,
  Users
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventSummary, useOrganizationEvents, useOrganizations } from "@/lib/api";

type WorkspaceSection = "events" | "campaigns" | "attendees" | "payments" | "agent-runs" | "templates" | "integrations" | "settings";

const sections: Record<WorkspaceSection, {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof CalendarDays;
  accent: string;
}> = {
  events: { eyebrow: "Event portfolio", title: "Events", description: "Create, plan, and launch every program from one workspace.", icon: CalendarDays, accent: "bg-blue-50 text-blue-700" },
  campaigns: { eyebrow: "Marketing command", title: "Campaigns", description: "Review generated launch copy and keep every send behind an approval gate.", icon: Megaphone, accent: "bg-rose-50 text-rose-700" },
  attendees: { eyebrow: "Registration desk", title: "Attendees", description: "Track registrations, sources, and the people behind each event.", icon: Users, accent: "bg-violet-50 text-violet-700" },
  payments: { eyebrow: "Revenue operations", title: "Payments", description: "Prepare paid-event collection without exposing credentials in the product.", icon: CreditCard, accent: "bg-amber-50 text-amber-700" },
  "agent-runs": { eyebrow: "Agent command", title: "Agent runs", description: "Run modular agents, inspect structured output, retry failures, and approve work.", icon: Bot, accent: "bg-emerald-50 text-emerald-700" },
  templates: { eyebrow: "Asset library", title: "Templates", description: "Reuse generated landing, registration, and certificate patterns across events.", icon: Layers3, accent: "bg-cyan-50 text-cyan-700" },
  integrations: { eyebrow: "Connection hub", title: "Integrations", description: "Keep external delivery providers disconnected until your organization is ready to configure them.", icon: PlugZap, accent: "bg-orange-50 text-orange-700" },
  settings: { eyebrow: "Organization control", title: "Settings", description: "Review the active organization and manage its event workspace.", icon: Settings2, accent: "bg-slate-100 text-slate-700" }
};

export function WorkspacePage({ section }: { section: string }) {
  const organizations = useOrganizations();
  const organization = organizations.data?.[0];
  const events = useOrganizationEvents(organization?.id ?? "");
  const details = sections[(section in sections ? section : "events") as WorkspaceSection];
  const Icon = details.icon;

  return (
    <AppShell>
      <section className="space-y-6">
        <header className="motion-enter flex flex-col gap-5 rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_hsl(222_30%_15%_/_0.04)] sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${details.accent}`}><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{details.eyebrow}</p>
              <h1 className="mt-1 text-3xl font-semibold">{details.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{details.description}</p>
            </div>
          </div>
          {organization ? <Button asChild className="shrink-0"><Link href={`/organizations/${organization.id}/events/new`}><Plus className="h-4 w-4" /> New event</Link></Button> : null}
        </header>

        {organizations.isLoading || events.isLoading ? <WorkspaceSkeleton /> : null}
        {organizations.isError ? <WorkspaceError /> : null}
        {organization && !events.isLoading ? <WorkspaceSurface section={section as WorkspaceSection} organizationId={organization.id} organizationName={organization.name} events={events.data ?? []} /> : null}
      </section>
    </AppShell>
  );
}

function WorkspaceSurface({ section, organizationId, organizationName, events }: { section: WorkspaceSection; organizationId: string; organizationName: string; events: EventSummary[] }) {
  if (section === "integrations") return <IntegrationsSurface />;
  if (section === "payments") return <PaymentsSurface events={events} />;
  if (section === "settings") return <SettingsSurface organizationName={organizationName} eventCount={events.length} organizationId={organizationId} />;

  const content = sectionContent(section, events);
  return (
    <div className="motion-enter motion-delay-1 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div><CardTitle>{content.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{content.description}</p></div>
          <Badge className="shrink-0">{events.length} events</Badge>
        </CardHeader>
        <CardContent className="grid gap-3">
          {events.length ? events.map((event) => <EventCommandCard key={event.id} event={event} section={section} organizationId={organizationId} />) : <EmptyEvents organizationId={organizationId} />}
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <Card className="border-slate-800 bg-[hsl(222_38%_12%)] text-white"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">Next best action</p><p className="mt-3 text-lg font-semibold">{content.nextTitle}</p><p className="mt-2 text-sm leading-6 text-slate-300">{content.nextDescription}</p><Link href={content.nextHref(organizationId)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">{content.nextAction} <ArrowUpRight className="h-4 w-4" /></Link></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm font-semibold">Approval policy</p><p className="mt-2 text-sm leading-6 text-muted-foreground">OpsPilot drafts assets and structured plans. Publishing, sending, and payment activation remain controlled by your team.</p></CardContent></Card>
      </aside>
    </div>
  );
}

function EventCommandCard({ event, section, organizationId }: { event: EventSummary; section: WorkspaceSection; organizationId: string }) {
  const labels: Partial<Record<WorkspaceSection, { title: string; detail: string }>> = {
    events: { title: event.type.replace(/_/g, " "), detail: event.brief?.status === "APPROVED" ? "Brief approved" : "Brief needs review" },
    campaigns: { title: "Marketing workspace", detail: "Generate and approve campaign drafts" },
    attendees: { title: "Registration desk", detail: `${event._count?.attendees ?? 0} registrations recorded` },
    "agent-runs": { title: "Agent command center", detail: "Run planner, form, landing, and marketing agents" },
    templates: { title: "Event asset kit", detail: "Landing page, form, and certificate patterns" }
  };
  const label = labels[section] ?? labels.events!;

  return <Link href={`/organizations/${organizationId}/events/${event.id}`} className="group flex flex-col gap-3 rounded-md border border-border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold">{event.title}</p><p className="mt-1 text-sm text-muted-foreground">{label.detail}</p></div><div className="flex shrink-0 items-center gap-2"><Badge>{label.title}</Badge><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div></Link>;
}

function IntegrationsSurface() {
  const providers = [["Gmail", "Campaign delivery"], ["WhatsApp Business", "Message delivery"], ["Google Calendar", "Event scheduling"], ["Zoom", "Meeting creation"], ["Stripe", "Payment collection"], ["Razorpay", "Payment collection"]];
  return <div className="motion-enter motion-delay-1 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{providers.map(([name, purpose]) => <Card key={name} className="transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-muted"><PlugZap className="h-5 w-5 text-primary" /></span><Badge>Not configured</Badge></div><p className="mt-5 font-semibold">{name}</p><p className="mt-1 text-sm text-muted-foreground">{purpose}</p><p className="mt-5 text-xs leading-5 text-muted-foreground">Credentials stay in environment variables. Provider activation is intentionally not available from the browser.</p></CardContent></Card>)}</div>;
}

function PaymentsSurface({ events }: { events: EventSummary[] }) {
  return <div className="motion-enter motion-delay-1 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><Card><CardHeader><CardTitle>Payment readiness</CardTitle><p className="mt-1 text-sm text-muted-foreground">No payment provider is connected, so no payment collection is active.</p></CardHeader><CardContent className="grid gap-3">{events.length ? events.map((event) => <div key={event.id} className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{event.title}</p><p className="mt-1 text-sm text-muted-foreground">{event.priceCents ? `${event.currency} ${(event.priceCents / 100).toLocaleString()}` : "Free or price not set"}</p></div><Badge>Provider required</Badge></div>) : <p className="text-sm text-muted-foreground">Create an event before configuring a paid registration flow.</p>}</CardContent></Card><Card className="border-amber-200 bg-amber-50"><CardContent className="p-5"><p className="text-sm font-semibold text-amber-900">Keep payments safe</p><p className="mt-2 text-sm leading-6 text-amber-800">Connect Stripe or Razorpay through deployment environment variables. This app does not store payment secrets in the UI.</p></CardContent></Card></div>;
}

function SettingsSurface({ organizationName, eventCount, organizationId }: { organizationName: string; eventCount: number; organizationId: string }) {
  return <div className="motion-enter motion-delay-1 grid gap-4 md:grid-cols-2"><Card><CardContent className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active organization</p><p className="mt-3 text-xl font-semibold">{organizationName}</p><p className="mt-2 text-sm text-muted-foreground">{eventCount} event{eventCount === 1 ? "" : "s"} managed in this workspace.</p><Link href={`/organizations/${organizationId}/events`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open events <ArrowUpRight className="h-4 w-4" /></Link></CardContent></Card><Card><CardContent className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Access control</p><p className="mt-3 text-xl font-semibold">Session protected</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Only organization members can access organization and event records through the API.</p></CardContent></Card></div>;
}

function EmptyEvents({ organizationId }: { organizationId: string }) {
  return <div className="rounded-md border border-dashed border-border p-8 text-center"><FileText className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 font-semibold">No events yet</p><p className="mt-1 text-sm text-muted-foreground">Start with a plain-language prompt. OpsPilot will turn it into a reviewable event brief.</p><Button asChild className="mt-5"><Link href={`/organizations/${organizationId}/events/new`}><Plus className="h-4 w-4" /> Create first event</Link></Button></div>;
}

function WorkspaceError() {
  return <Card><CardContent className="p-6"><p className="font-semibold">Workspace data is unavailable</p><p className="mt-2 text-sm text-muted-foreground">Check that the API, PostgreSQL, and Redis services are running, then refresh this page.</p><Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-primary">Sign in again <ArrowUpRight className="ml-2 h-4 w-4" /></Link></CardContent></Card>;
}

function WorkspaceSkeleton() {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="h-72 animate-pulse rounded-lg bg-muted" /><div className="h-48 animate-pulse rounded-lg bg-muted" /></div>;
}

function sectionContent(section: WorkspaceSection, events: EventSummary[]) {
  const content: Record<Exclude<WorkspaceSection, "integrations" | "payments" | "settings">, { title: string; description: string; nextTitle: string; nextDescription: string; nextAction: string; nextHref: (organizationId: string) => string }> = {
    events: { title: "Your event portfolio", description: "Open an event to continue its plan, assets, attendees, or launch checklist.", nextTitle: events.length ? "Create the next brief" : "Create your first brief", nextDescription: "Use one natural-language prompt instead of a long setup form.", nextAction: "Create event", nextHref: (id) => `/organizations/${id}/events/new` },
    campaigns: { title: "Campaign workspaces", description: "Every event has approval-required marketing drafts ready to generate from its dashboard.", nextTitle: "Generate campaign assets", nextDescription: "Open an event, then use its Marketing tab to create drafts for email, WhatsApp, LinkedIn, and Instagram.", nextAction: "Open events", nextHref: (id) => `/organizations/${id}/events` },
    attendees: { title: "Registration operations", description: "Open an event to inspect its attendee list and source data.", nextTitle: "Publish registration", nextDescription: "Generate the public registration form in an event dashboard before sharing its landing page.", nextAction: "Open events", nextHref: (id) => `/organizations/${id}/events` },
    "agent-runs": { title: "Agent work queue", description: "Each event exposes typed agent runs with status, retry, and human approval controls.", nextTitle: "Run your first agent", nextDescription: "Open an event and select Agents to produce a structured output for review.", nextAction: "Open events", nextHref: (id) => `/organizations/${id}/events` },
    templates: { title: "Reusable event assets", description: "Generated landing pages, registration forms, and certificate metadata stay attached to each event.", nextTitle: "Build an asset kit", nextDescription: "Open an event to generate its landing page and form from the approved event brief.", nextAction: "Open events", nextHref: (id) => `/organizations/${id}/events` }
  };
  return content[section as keyof typeof content] ?? content.events;
}
