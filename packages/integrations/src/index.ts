export type IntegrationProviderName =
  | "GMAIL"
  | "GOOGLE_CALENDAR"
  | "GOOGLE_MEET"
  | "ZOOM"
  | "RAZORPAY"
  | "STRIPE"
  | "WHATSAPP_BUSINESS";

export interface ProviderCredentials {
  credentialRef: string;
}

export interface IntegrationHealth {
  provider: IntegrationProviderName;
  ok: boolean;
  message: string;
  checkedAt: string;
}

export interface EmailDraftPayload {
  to: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface CalendarEventPayload {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  attendeeEmails: string[];
  timezone: string;
}

export interface MeetingPayload {
  title: string;
  startAt?: string;
  endAt?: string;
  timezone?: string;
}

export interface PaymentCheckoutPayload {
  amountCents: number;
  currency: string;
  description: string;
  attendeeEmail?: string;
  metadata?: Record<string, string>;
}

export interface WhatsAppMessagePayload {
  to: string;
  templateName?: string;
  body: string;
  variables?: Record<string, string>;
}

export interface EmailProvider {
  readonly provider: "GMAIL";
  checkHealth(credentials: ProviderCredentials): Promise<IntegrationHealth>;
  createDraft(credentials: ProviderCredentials, payload: EmailDraftPayload): Promise<{ draftId: string }>;
}

export interface CalendarProvider {
  readonly provider: "GOOGLE_CALENDAR";
  checkHealth(credentials: ProviderCredentials): Promise<IntegrationHealth>;
  createEvent(credentials: ProviderCredentials, payload: CalendarEventPayload): Promise<{ calendarEventId: string; htmlLink?: string }>;
}

export interface MeetingProvider {
  readonly provider: "GOOGLE_MEET" | "ZOOM";
  checkHealth(credentials: ProviderCredentials): Promise<IntegrationHealth>;
  createMeeting(credentials: ProviderCredentials, payload: MeetingPayload): Promise<{ meetingId: string; joinUrl: string }>;
}

export interface PaymentProvider {
  readonly provider: "RAZORPAY" | "STRIPE";
  checkHealth(credentials: ProviderCredentials): Promise<IntegrationHealth>;
  createCheckout(credentials: ProviderCredentials, payload: PaymentCheckoutPayload): Promise<{ checkoutId: string; checkoutUrl?: string }>;
  verifyWebhook?(rawBody: string, signature: string): Promise<boolean>;
}

export interface WhatsAppBusinessProvider {
  readonly provider: "WHATSAPP_BUSINESS";
  checkHealth(credentials: ProviderCredentials): Promise<IntegrationHealth>;
  createMessageDraft(credentials: ProviderCredentials, payload: WhatsAppMessagePayload): Promise<{ draftId: string }>;
}

export class IntegrationNotConfiguredError extends Error {
  constructor(provider: IntegrationProviderName) {
    super(`${provider} integration is not configured for this organization.`);
    this.name = "IntegrationNotConfiguredError";
  }
}
