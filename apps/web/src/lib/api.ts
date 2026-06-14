"use client";

import { useQuery } from "@tanstack/react-query";
import type { EventType } from "@orchestraiq/shared";

interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    events: number;
    members: number;
  };
}

export interface EventBrief {
  id: string;
  eventId: string;
  originalPrompt: string;
  status: "DRAFT" | "APPROVED";
  eventType: EventType | null;
  topic: string | null;
  targetAudience: string | null;
  mode: string | null;
  location: string | null;
  dateTimeText: string | null;
  durationMinutes: number | null;
  priceCents: number | null;
  currency: string;
  targetAttendees: number | null;
  language: string | null;
  tone: string | null;
  goal: string | null;
  missingFields: string[];
  missingQuestions: string[];
}

export interface LandingPageContent {
  id: string;
  eventId: string;
  status: "DRAFT" | "PUBLISHED";
  hero: Record<string, unknown>;
  problem: Record<string, unknown>;
  outcomes: Record<string, unknown>;
  agenda: Record<string, unknown>;
  speaker: Record<string, unknown>;
  benefits: Record<string, unknown>;
  certificate: Record<string, unknown>;
  pricing: Record<string, unknown>;
  faqs: Record<string, unknown>;
  cta: Record<string, unknown>;
}

export interface RegistrationField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "number" | "select";
  required: boolean;
  options?: string[];
}

export interface RegistrationFormContent {
  id: string;
  eventId: string;
  status: "DRAFT" | "PUBLISHED";
  title: string;
  description: string | null;
  fields: RegistrationField[];
}

export interface Attendee {
  id: string;
  eventId: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string | null;
  responses: Record<string, unknown>;
  createdAt: string;
}

export interface EventSummary {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description: string | null;
  type: EventType;
  status: string;
  timezone: string;
  startAt: string | null;
  endAt: string | null;
  venue: string | null;
  onlineUrl: string | null;
  audience: string | null;
  objective: string | null;
  capacity: number | null;
  priceCents: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  brief?: EventBrief | null;
  landingPage?: LandingPageContent | null;
  registrationForm?: RegistrationFormContent | null;
  attendees?: Attendee[];
  _count?: {
    attendees: number;
  };
  organization?: {
    slug: string;
    name: string;
  };
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiGet<OrganizationSummary[]>("/organizations")
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => apiGet<OrganizationSummary>(`/organizations/${orgId}`),
    enabled: Boolean(orgId)
  });
}

export function useOrganizationEvents(orgId: string) {
  return useQuery({
    queryKey: ["organization-events", orgId],
    queryFn: () => apiGet<EventSummary[]>(`/organizations/${orgId}/events`),
    enabled: Boolean(orgId)
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiGet<EventSummary>(`/events/${eventId}`),
    enabled: Boolean(eventId)
  });
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export function createEventFromPrompt(orgId: string, prompt: string) {
  return apiRequest<EventSummary>(`/organizations/${orgId}/events/from-prompt`, {
    method: "POST",
    body: JSON.stringify({ prompt })
  });
}

export function updateEventBrief(eventId: string, payload: Record<string, unknown>) {
  return apiRequest<EventBrief>(`/events/${eventId}/brief`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function approveEventBrief(eventId: string, payload: Record<string, unknown>) {
  return apiRequest<EventBrief>(`/events/${eventId}/brief/approve`, {
    method: "POST",
    body: JSON.stringify({ ...payload, approve: true })
  });
}

export function generateLandingPage(eventId: string) {
  return apiRequest<LandingPageContent>(`/events/${eventId}/landing-page/generate`, {
    method: "POST"
  });
}

export function generateRegistrationForm(eventId: string) {
  return apiRequest<RegistrationFormContent>(`/events/${eventId}/registration-form/generate`, {
    method: "POST"
  });
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => apiGet<Attendee[]>(`/events/${eventId}/attendees`),
    enabled: Boolean(eventId)
  });
}

export function usePublicEvent(orgSlug: string, eventSlug: string) {
  return useQuery({
    queryKey: ["public-event", orgSlug, eventSlug],
    queryFn: () => apiGet<EventSummary>(`/events/public/${orgSlug}/${eventSlug}`),
    enabled: Boolean(orgSlug && eventSlug)
  });
}

export function submitPublicRegistration(orgSlug: string, eventSlug: string, payload: Record<string, unknown>) {
  return apiRequest<Attendee>(`/events/public/${orgSlug}/${eventSlug}/register`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
