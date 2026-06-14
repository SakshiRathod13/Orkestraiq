"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Megaphone,
  Save,
  Settings,
  Sparkles,
  Users,
  Video
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { approveEventBrief, EventBrief, EventSummary, updateEventBrief, useEvent } from "@/lib/api";

const eventTypes = ["WORKSHOP", "WEBINAR", "TRAINING", "BOOTCAMP", "COLLEGE_FEST", "ORIENTATION", "PAID_CLASS", "MEETUP", "OTHER"];
const tabs = ["Overview", "Plan", "Landing Page", "Registration Form", "Marketing", "Meeting", "Attendees", "Analytics", "Agents", "Settings"] as const;

export function EventDashboardPage({ eventId }: { orgId: string; eventId: string }) {
  const event = useEvent(eventId);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Event dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold">{event.data?.title ?? "Event"}</h1>
        </div>
        <div className="flex gap-2">
          <Badge>{event.data?.type?.replace(/_/g, " ") ?? "LOADING"}</Badge>
          <Badge>{event.data?.status ?? "LOADING"}</Badge>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${
                activeTab === tab ? "border-primary bg-card text-foreground" : "border-border text-muted-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {event.isLoading ? <div className="h-40 animate-pulse rounded-lg bg-muted" /> : null}
      {event.isError ? <Card><CardContent className="p-5">Unable to load event.</CardContent></Card> : null}
      {event.data ? (
        <>
          {activeTab === "Overview" ? <OverviewTab event={event.data} /> : null}
          {activeTab === "Plan" ? <PlanTab eventId={eventId} event={event} /> : null}
          {activeTab === "Landing Page" ? <PlaceholderTab icon={FileText} title="Landing Page" body="Landing page generation and editing will appear here after the landing page agent is connected to publishable page records." /> : null}
          {activeTab === "Registration Form" ? <PlaceholderTab icon={ClipboardCheck} title="Registration Form" body="Generated registration fields, approval state, and public form preview will appear here." /> : null}
          {activeTab === "Marketing" ? <PlaceholderTab icon={Megaphone} title="Marketing" body="Campaign drafts, reminders, and channel-specific content will appear here." /> : null}
          {activeTab === "Meeting" ? <PlaceholderTab icon={Video} title="Meeting" body="Meeting provider setup, venue details, and calendar instructions will appear here." /> : null}
          {activeTab === "Attendees" ? <PlaceholderTab icon={Users} title="Attendees" body="Registration and attendee management will appear here once public forms are implemented." /> : null}
          {activeTab === "Analytics" ? <PlaceholderTab icon={BarChart3} title="Analytics" body="Registration funnel, revenue, conversion, attendance, and campaign analytics will appear here." /> : null}
          {activeTab === "Agents" ? <PlaceholderTab icon={Sparkles} title="Agents" body="Agent run activity, approval queues, retry controls, and generated outputs will appear here." /> : null}
          {activeTab === "Settings" ? <PlaceholderTab icon={Settings} title="Settings" body="Event configuration, publishing controls, and ownership settings will appear here." /> : null}
        </>
      ) : null}
    </AppShell>
  );
}

function OverviewTab({ event }: { event: EventSummary }) {
  const checklist = buildLaunchChecklist(event);
  const targetParticipants = event.capacity ?? event.brief?.targetAttendees ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Status" value={event.status} />
        <MetricCard label="Target participants" value={targetParticipants || "TBD"} />
        <MetricCard label="Current registrations" value="0" />
        <MetricCard label="Revenue" value="Placeholder" />
        <MetricCard label="Conversion" value="Placeholder" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Launch checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge>{item.done ? "Done" : "Open"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI recommendations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Placeholder recommendations until agent outputs are surfaced in this dashboard.</p>
            <p>Suggested next step: run the COO and Event Planner agents after approving the event brief.</p>
            <p>OpsPilot will later rank readiness, launch blockers, and campaign opportunities here.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <SnapshotItem icon={CalendarDays} label="Date/time" value={event.brief?.dateTimeText ?? event.startAt ?? "TBD"} />
          <SnapshotItem icon={Users} label="Audience" value={event.audience ?? event.brief?.targetAudience ?? "TBD"} />
          <SnapshotItem icon={Video} label="Mode" value={event.brief?.mode ?? (event.onlineUrl ? "online" : event.venue ? "offline" : "TBD")} />
        </CardContent>
      </Card>
    </div>
  );
}

function PlanTab({ eventId, event }: { eventId: string; event: ReturnType<typeof useEvent> }) {
  const brief = event.data?.brief;
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Partial<EventBrief>>();
  const steps = ["Extracted fields", "Missing answers", "Approval"];

  useEffect(() => {
    if (brief) {
      form.reset({
        eventType: brief.eventType,
        topic: brief.topic,
        targetAudience: brief.targetAudience,
        mode: brief.mode,
        location: brief.location,
        dateTimeText: brief.dateTimeText,
        durationMinutes: brief.durationMinutes,
        priceCents: brief.priceCents,
        currency: brief.currency,
        targetAttendees: brief.targetAttendees,
        language: brief.language,
        tone: brief.tone,
        goal: brief.goal
      });
    }
  }, [brief, form]);

  const missingQuestions = useMemo(() => brief?.missingQuestions ?? [], [brief]);

  async function save(values: Partial<EventBrief>) {
    await updateEventBrief(eventId, coerceNumbers(values));
    setMessage("Brief saved.");
    await event.refetch();
  }

  async function approve(values: Partial<EventBrief>) {
    await approveEventBrief(eventId, coerceNumbers(values));
    setMessage("Brief approved and saved to the event.");
    await event.refetch();
  }

  if (!brief) {
    return <Card><CardContent className="p-5">No event brief exists yet. Create this event from a prompt to use the planning wizard.</CardContent></Card>;
  }

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(save)}>
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`rounded-md border px-3 py-2 text-sm ${step === index ? "border-primary bg-card" : "border-border text-muted-foreground"}`}
            onClick={() => setStep(index)}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <Card>
          <CardHeader><CardTitle>Extracted fields</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Event type">
              <select className="h-10 rounded-md border border-border bg-card px-3 text-sm" {...form.register("eventType")}>
                {eventTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}
              </select>
            </Field>
            <Field label="Topic"><Input {...form.register("topic")} /></Field>
            <Field label="Target audience"><Input {...form.register("targetAudience")} /></Field>
            <Field label="Mode"><Input {...form.register("mode")} placeholder="online, offline, hybrid" /></Field>
            <Field label="Location"><Input {...form.register("location")} /></Field>
            <Field label="Date/time"><Input {...form.register("dateTimeText")} /></Field>
            <Field label="Duration minutes"><Input type="number" {...form.register("durationMinutes")} /></Field>
            <Field label="Price cents"><Input type="number" {...form.register("priceCents")} /></Field>
            <Field label="Target attendees"><Input type="number" {...form.register("targetAttendees")} /></Field>
            <Field label="Language"><Input {...form.register("language")} /></Field>
            <Field label="Tone"><Input {...form.register("tone")} /></Field>
            <Field label="Goal"><Textarea className="min-h-20" {...form.register("goal")} /></Field>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader><CardTitle>Missing questions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {missingQuestions.length > 0 ? missingQuestions.map((question) => (
              <div key={question} className="rounded-md border border-border p-3 text-sm">{question}</div>
            )) : <p className="text-sm text-muted-foreground">All required brief fields are present.</p>}
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader><CardTitle>Approval</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border border-border p-4">
              <p className="text-sm font-medium">Original prompt</p>
              <p className="mt-2 text-sm text-muted-foreground">{brief.originalPrompt}</p>
            </div>
            <Button type="button" onClick={form.handleSubmit(approve)}>
              <CheckCircle2 className="h-4 w-4" />
              Approve event brief
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="flex gap-3">
        <Button type="submit"><Save className="h-4 w-4" />Save progress</Button>
        <Button type="button" onClick={() => setStep(Math.min(step + 1, steps.length - 1))}>Next</Button>
      </div>
    </form>
  );
}

function PlaceholderTab({ icon: Icon, title, body }: { icon: typeof FileText; title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SnapshotItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function buildLaunchChecklist(event: EventSummary) {
  return [
    { label: "Event brief approved", done: event.brief?.status === "APPROVED" },
    { label: "Target audience defined", done: Boolean(event.audience ?? event.brief?.targetAudience) },
    { label: "Date/time captured", done: Boolean(event.brief?.dateTimeText ?? event.startAt) },
    { label: "Mode or location captured", done: Boolean(event.brief?.mode ?? event.venue ?? event.onlineUrl) },
    { label: "Target participants set", done: Boolean(event.capacity ?? event.brief?.targetAttendees) },
    { label: "Agent recommendations reviewed", done: false },
    { label: "Registration form published", done: false },
    { label: "Landing page published", done: false }
  ];
}

function coerceNumbers(values: Partial<EventBrief>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values };

  for (const field of ["durationMinutes", "priceCents", "targetAttendees"] as const) {
    if (payload[field] === null || payload[field] === undefined || payload[field] === "") {
      delete payload[field];
    } else {
      payload[field] = Number(payload[field]);
    }
  }

  return payload;
}
