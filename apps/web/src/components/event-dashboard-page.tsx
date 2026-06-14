"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
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
import {
  approveEventBrief,
  approveAgentRun,
  Attendee,
  EventBrief,
  EventSummary,
  generateLandingPage,
  generateMarketingDraft,
  generateRegistrationForm,
  approveMarketingDraft,
  RegistrationField,
  retryAgentRun,
  runAgent,
  AgentRun,
  rejectMarketingDraft,
  rejectAgentRun,
  updateEventBrief,
  useEvent,
  useEventAgentRuns,
  useEventAnalytics,
  useEventAttendees
} from "@/lib/api";

const eventTypes = ["WORKSHOP", "WEBINAR", "TRAINING", "BOOTCAMP", "COLLEGE_FEST", "ORIENTATION", "PAID_CLASS", "MEETUP", "OTHER"];
const tabs = ["Overview", "Plan", "Landing Page", "Registration Form", "Marketing", "Meeting", "Attendees", "Analytics", "Agents", "Settings"] as const;
const commandCenterAgents = ["COO", "EVENT_PLANNER", "FORM", "LANDING_PAGE", "MARKETING", "DESIGN", "MEETING", "ANALYTICS", "DOCUMENTATION"];

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
          {activeTab === "Landing Page" ? <LandingPageTab event={event.data} onRefresh={() => event.refetch()} /> : null}
          {activeTab === "Registration Form" ? <RegistrationFormTab event={event.data} onRefresh={() => event.refetch()} /> : null}
          {activeTab === "Marketing" ? <MarketingTab event={event.data} onRefresh={() => event.refetch()} /> : null}
          {activeTab === "Meeting" ? <PlaceholderTab icon={Video} title="Meeting" body="Meeting provider setup, venue details, and calendar instructions will appear here." /> : null}
          {activeTab === "Attendees" ? <AttendeesTab eventId={eventId} /> : null}
          {activeTab === "Analytics" ? <AnalyticsTab eventId={eventId} /> : null}
          {activeTab === "Agents" ? <AgentsTab eventId={eventId} /> : null}
          {activeTab === "Settings" ? <PlaceholderTab icon={Settings} title="Settings" body="Event configuration, publishing controls, and ownership settings will appear here." /> : null}
        </>
      ) : null}
    </AppShell>
  );
}

function OverviewTab({ event }: { event: EventSummary }) {
  const checklist = buildLaunchChecklist(event);
  const targetParticipants = event.capacity ?? event.brief?.targetAttendees ?? 0;
  const registrations = event._count?.attendees ?? event.attendees?.length ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Status" value={event.status} />
        <MetricCard label="Target participants" value={targetParticipants || "TBD"} />
        <MetricCard label="Current registrations" value={registrations} />
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

function LandingPageTab({ event, onRefresh }: { event: EventSummary; onRefresh: () => Promise<unknown> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const publicPath = event.organization ? `/public/events/${event.organization.slug}/${event.slug}` : null;

  async function generate() {
    setIsGenerating(true);
    await generateLandingPage(event.id);
    await onRefresh();
    setIsGenerating(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Landing Page</CardTitle>
          <div className="flex gap-2">
            <Button type="button" onClick={generate} disabled={isGenerating}>
              <FileText className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
            {publicPath ? <Button asChild><Link href={publicPath}>Open public page</Link></Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {event.landingPage ? (
          <>
            <SectionPreview title="Hero" section={event.landingPage.hero} />
            <SectionPreview title="Problem statement" section={event.landingPage.problem} />
            <SectionPreview title="Learning outcomes" section={event.landingPage.outcomes} />
            <SectionPreview title="Agenda" section={event.landingPage.agenda} />
            <SectionPreview title="Speaker" section={event.landingPage.speaker} />
            <SectionPreview title="Benefits" section={event.landingPage.benefits} />
            <SectionPreview title="Certificate" section={event.landingPage.certificate} />
            <SectionPreview title="Pricing" section={event.landingPage.pricing} />
            <SectionPreview title="FAQs" section={event.landingPage.faqs} />
            <SectionPreview title="CTA" section={event.landingPage.cta} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No landing page generated yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RegistrationFormTab({ event, onRefresh }: { event: EventSummary; onRefresh: () => Promise<unknown> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const publicPath = event.organization ? `/public/events/${event.organization.slug}/${event.slug}/register` : null;

  async function generate() {
    setIsGenerating(true);
    await generateRegistrationForm(event.id);
    await onRefresh();
    setIsGenerating(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Registration Form</CardTitle>
          <div className="flex gap-2">
            <Button type="button" onClick={generate} disabled={isGenerating}>
              <ClipboardCheck className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
            {publicPath ? <Button asChild><Link href={publicPath}>Open form</Link></Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {event.registrationForm ? (
          <>
            <p className="text-sm text-muted-foreground">{event.registrationForm.description}</p>
            {event.registrationForm.fields.map((field) => (
              <FieldPreview key={field.key} field={field} />
            ))}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No registration form generated yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function AttendeesTab({ eventId }: { eventId: string }) {
  const attendees = useEventAttendees(eventId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendees</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {attendees.isLoading ? <div className="h-24 animate-pulse rounded-md bg-muted" /> : null}
        {attendees.data?.length === 0 ? <p className="text-sm text-muted-foreground">No attendee submissions yet.</p> : null}
        {attendees.data?.map((attendee) => (
          <AttendeeRow key={attendee.id} attendee={attendee} />
        ))}
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ eventId }: { eventId: string }) {
  const analytics = useEventAnalytics(eventId);

  return (
    <div className="grid gap-6">
      {analytics.isLoading ? <div className="h-32 animate-pulse rounded-md bg-muted" /> : null}
      {analytics.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <MetricCard label="Target" value={analytics.data.metrics.targetParticipants || "TBD"} />
            <MetricCard label="Registrations" value={analytics.data.metrics.registrations} />
            <MetricCard label="Conversion" value={`${analytics.data.metrics.conversionRate}%`} />
            <MetricCard label="Revenue" value="Placeholder" />
            <MetricCard label="Attendance" value="Placeholder" />
          </div>
          <Card>
            <CardHeader><CardTitle>Registration funnel</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {analytics.data.funnel.map((item) => (
                <div key={item.stage} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span>{item.stage}</span>
                  <Badge>{item.placeholder ? "Placeholder" : item.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Attendee source tracking</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {analytics.data.attendeeSources.length > 0 ? analytics.data.attendeeSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span>{source.source}</span>
                  <Badge>{source.count}</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No sources yet. Future registrations default to direct.</p>}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function AgentsTab({ eventId }: { eventId: string }) {
  const runs = useEventAgentRuns(eventId);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function run(name: string) {
    setBusyId(name);
    await runAgent(eventId, name);
    await runs.refetch();
    setBusyId(null);
  }

  async function retry(runId: string) {
    setBusyId(runId);
    await retryAgentRun(runId);
    await runs.refetch();
    setBusyId(null);
  }

  async function review(runId: string, action: "approve" | "reject") {
    setBusyId(runId);
    if (action === "approve") {
      await approveAgentRun(runId);
    } else {
      await rejectAgentRun(runId);
    }
    await runs.refetch();
    setBusyId(null);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Agent command center</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {commandCenterAgents.map((name) => (
            <Button key={name} type="button" onClick={() => run(name)} disabled={busyId === name}>
              <Sparkles className="h-4 w-4" />
              {name.replace(/_/g, " ")}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Agent timeline and logs</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {runs.isLoading ? <div className="h-24 animate-pulse rounded-md bg-muted" /> : null}
          {runs.data?.length === 0 ? <p className="text-sm text-muted-foreground">No agent runs yet.</p> : null}
          {runs.data?.map((runItem) => (
            <AgentRunCard
              key={runItem.id}
              run={runItem}
              busy={busyId === runItem.id}
              onRetry={() => retry(runItem.id)}
              onApprove={() => review(runItem.id, "approve")}
              onReject={() => review(runItem.id, "reject")}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AgentRunCard({
  run,
  busy,
  onRetry,
  onApprove,
  onReject
}: {
  run: AgentRun;
  busy: boolean;
  onRetry: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-border p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">{run.agentName.replace(/_/g, " ")}</p>
          <p className="text-sm text-muted-foreground">Attempt {run.attempt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{run.status}</Badge>
          <Badge>{run.approvalStatus}</Badge>
        </div>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
        <span>Created: {formatDate(run.createdAt)}</span>
        <span>Started: {formatDate(run.startedAt)}</span>
        <span>Completed: {formatDate(run.completedAt)}</span>
      </div>
      {run.error ? <p className="rounded-md border border-border p-3 text-sm text-red-600">{run.error}</p> : null}
      {run.output ? <SectionPreview title="Structured output" section={run.output} /> : null}
      <div className="flex flex-wrap gap-2">
        {run.status === "FAILED" ? <Button type="button" disabled={busy} onClick={onRetry}>Retry failed run</Button> : null}
        {run.approvalStatus === "PENDING" ? (
          <>
            <Button type="button" disabled={busy} onClick={onApprove}>Approve</Button>
            <Button type="button" disabled={busy} onClick={onReject}>Reject</Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MarketingTab({ event, onRefresh }: { event: EventSummary; onRefresh: () => Promise<unknown> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  async function generate() {
    setIsGenerating(true);
    await generateMarketingDraft(event.id);
    await onRefresh();
    setIsGenerating(false);
  }

  async function review(action: "approve" | "reject") {
    setIsReviewing(true);
    if (action === "approve") {
      await approveMarketingDraft(event.id);
    } else {
      await rejectMarketingDraft(event.id);
    }
    await onRefresh();
    setIsReviewing(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Marketing Assets</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Drafts only. No messages are sent.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generate} disabled={isGenerating}>
              <Megaphone className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate drafts"}
            </Button>
            {event.marketingDraft ? (
              <>
                <Button type="button" onClick={() => review("approve")} disabled={isReviewing}>Approve</Button>
                <Button type="button" onClick={() => review("reject")} disabled={isReviewing}>Reject</Button>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {event.marketingDraft ? (
          <>
            <Badge>{event.marketingDraft.approvalStatus}</Badge>
            <SectionPreview title="Email campaign drafts" section={event.marketingDraft.emailCampaign} />
            <SectionPreview title="WhatsApp message drafts" section={event.marketingDraft.whatsappMessages} />
            <SectionPreview title="LinkedIn post" section={event.marketingDraft.linkedInPost} />
            <SectionPreview title="Instagram caption" section={event.marketingDraft.instagramCaption} />
            <SectionPreview title="Reminder sequence" section={event.marketingDraft.reminderSequence} />
            <SectionPreview title="Poster prompt" section={event.marketingDraft.posterPrompt} />
            <SectionPreview title="Certificate template metadata" section={event.marketingDraft.certificateTemplate} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No marketing drafts generated yet.</p>
        )}
      </CardContent>
    </Card>
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

function SectionPreview({ title, section }: { title: string; section: Record<string, unknown> }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm font-medium">{title}</p>
      <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{JSON.stringify(section, null, 2)}</pre>
    </div>
  );
}

function FieldPreview({ field }: { field: RegistrationField }) {
  return (
    <div className="rounded-md border border-border p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{field.label}</span>
        <Badge>{field.type}</Badge>
      </div>
      <p className="mt-1 text-muted-foreground">{field.required ? "Required" : "Optional"}</p>
    </div>
  );
}

function AttendeeRow({ attendee }: { attendee: Attendee }) {
  return (
    <div className="rounded-md border border-border p-3 text-sm">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">{attendee.name}</p>
          <p className="text-muted-foreground">{attendee.email}</p>
        </div>
        <span className="text-muted-foreground">{new Date(attendee.createdAt).toLocaleString()}</span>
      </div>
    </div>
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
    { label: "Registration form published", done: event.registrationForm?.status === "PUBLISHED" },
    { label: "Landing page published", done: event.landingPage?.status === "PUBLISHED" }
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

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}
