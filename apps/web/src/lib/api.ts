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
