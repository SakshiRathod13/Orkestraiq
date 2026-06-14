"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { approveEventBrief, EventBrief, updateEventBrief, useEvent } from "@/lib/api";

const eventTypes = ["WORKSHOP", "WEBINAR", "TRAINING", "BOOTCAMP", "COLLEGE_FEST", "ORIENTATION", "PAID_CLASS", "MEETUP", "OTHER"];
const steps = ["Extracted fields", "Missing answers", "Approval"];

export function EventBriefPage({ eventId }: { orgId: string; eventId: string }) {
  const event = useEvent(eventId);
  const brief = event.data?.brief;
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Partial<EventBrief>>();

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

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Event brief wizard</p>
          <h1 className="mt-1 text-2xl font-semibold">{event.data?.title ?? "Event"}</h1>
        </div>
        <Badge>{brief?.status ?? "LOADING"}</Badge>
      </div>

      {event.isLoading ? <div className="h-40 animate-pulse rounded-lg bg-muted" /> : null}
      {event.isError ? <Card><CardContent className="p-5">Unable to load event.</CardContent></Card> : null}
      {brief ? (
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
              <CardHeader>
                <CardTitle>Extracted fields</CardTitle>
              </CardHeader>
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
              <CardHeader>
                <CardTitle>Missing questions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {missingQuestions.length > 0 ? missingQuestions.map((question) => (
                  <div key={question} className="rounded-md border border-border p-3 text-sm">{question}</div>
                )) : <p className="text-sm text-muted-foreground">All required brief fields are present.</p>}
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Approval</CardTitle>
              </CardHeader>
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
      ) : null}
    </AppShell>
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
