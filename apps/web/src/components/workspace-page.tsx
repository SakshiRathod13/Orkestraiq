"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrganizations } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy: Record<string, { title: string; description: string; action: string }> = {
  events: { title: "Events", description: "Manage every event in your organizations.", action: "Open events" },
  campaigns: { title: "Campaigns", description: "Approval-required marketing drafts are available from each event's Marketing tab.", action: "Open events" },
  attendees: { title: "Attendees", description: "Registration submissions are available from each event's Attendees tab.", action: "Open events" },
  payments: { title: "Payments", description: "Payment records are ready for a connected Stripe or Razorpay provider.", action: "Configure integrations" },
  "agent-runs": { title: "Agent Runs", description: "Run, review, and retry agents from each event's Agents tab.", action: "Open events" },
  templates: { title: "Templates", description: "Landing page, registration, and certificate outputs are generated per event.", action: "Open events" },
  integrations: { title: "Integrations", description: "Connect provider credentials through environment variables before enabling external delivery.", action: "Read setup" },
  settings: { title: "Organization Settings", description: "Organization membership is protected by the signed-in account.", action: "Open events" }
};

export function WorkspacePage({ section }: { section: string }) {
  const organizations = useOrganizations();
  const details = copy[section] ?? copy.events!;
  const firstOrganization = organizations.data?.[0];
  const href = section === "integrations" ? "/#integrations" : firstOrganization ? `/organizations/${firstOrganization.id}/events` : "/login";
  return <AppShell><section className="space-y-6"><div><p className="text-sm font-medium text-muted-foreground">OpsPilot workspace</p><h1 className="mt-2 text-3xl font-semibold">{details.title}</h1><p className="mt-2 text-muted-foreground">{details.description}</p></div><Card><CardHeader><CardTitle>{firstOrganization ? firstOrganization.name : "No organization available"}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">{organizations.isError ? "Sign in to view your workspace." : "Choose an event to continue."}</p><Link href={href} className="text-sm font-medium text-primary underline">{details.action}</Link></CardContent></Card></section></AppShell>;
}
