"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicEvent } from "@/lib/api";

export function PublicLandingPage({ orgSlug, eventSlug }: { orgSlug: string; eventSlug: string }) {
  const event = usePublicEvent(orgSlug, eventSlug);
  const landing = event.data?.landingPage;

  if (event.isLoading) {
    return <main className="min-h-screen bg-background p-6"><div className="mx-auto h-40 max-w-5xl animate-pulse rounded-lg bg-muted" /></main>;
  }

  if (event.isError || !event.data || !landing) {
    return <main className="min-h-screen bg-background p-6"><p>Event page unavailable.</p></main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-5xl gap-5 px-6 py-12">
          <p className="text-sm font-medium text-muted-foreground">{text(landing.hero.eyebrow)}</p>
          <h1 className="text-4xl font-semibold">{text(landing.hero.title) || event.data.title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{text(landing.hero.subtitle)}</p>
          <p className="text-sm text-muted-foreground">{text(landing.hero.dateTime)}</p>
          <Button asChild>
            <Link href={`/public/events/${orgSlug}/${eventSlug}/register`}>{text(landing.cta.label) || "Register now"}</Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8">
        <ContentSection title="Problem statement" section={landing.problem} />
        <ListSection title="Learning outcomes" section={landing.outcomes} />
        <ListSection title="Agenda" section={landing.agenda} />
        <ContentSection title="Speaker" section={landing.speaker} />
        <ListSection title="Benefits" section={landing.benefits} />
        <ContentSection title="Certificate" section={landing.certificate} />
        <ContentSection title="Pricing" section={landing.pricing} />
        <FaqSection section={landing.faqs} />
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">{text(landing.cta.body)}</p>
            <Button asChild><Link href={`/public/events/${orgSlug}/${eventSlug}/register`}>{text(landing.cta.label) || "Register now"}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ContentSection({ title, section }: { title: string; section: Record<string, unknown> }) {
  return (
    <Card>
      <CardHeader><CardTitle>{text(section.title) || title}</CardTitle></CardHeader>
      <CardContent className="text-muted-foreground">{text(section.body) || text(section.bio) || text(section.price)}</CardContent>
    </Card>
  );
}

function ListSection({ title, section }: { title: string; section: Record<string, unknown> }) {
  const items = Array.isArray(section.items) ? section.items : [];
  return (
    <Card>
      <CardHeader><CardTitle>{text(section.title) || title}</CardTitle></CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-muted-foreground">
          {items.map((item, index) => <li key={index}>{text(item)}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

function FaqSection({ section }: { section: Record<string, unknown> }) {
  const items = Array.isArray(section.items) ? section.items : [];
  return (
    <Card>
      <CardHeader><CardTitle>{text(section.title) || "FAQs"}</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        {items.map((item, index) => {
          const faq = item as Record<string, unknown>;
          return (
            <div key={index}>
              <p className="font-medium">{text(faq.question)}</p>
              <p className="text-sm text-muted-foreground">{text(faq.answer)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
