import { Injectable } from "@nestjs/common";
import { EventType } from "@prisma/client";

interface ExtractedBrief {
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

const requiredFields: Array<keyof ExtractedBrief> = [
  "eventType",
  "topic",
  "targetAudience",
  "mode",
  "dateTimeText",
  "durationMinutes",
  "goal"
];

const missingQuestionMap: Record<string, string> = {
  eventType: "What type of event is this: workshop, webinar, training, bootcamp, orientation, paid class, or something else?",
  topic: "What is the main topic or title for this event?",
  targetAudience: "Who is the target audience?",
  mode: "Will this be online, offline, or hybrid?",
  dateTimeText: "When should this event happen?",
  durationMinutes: "How long should the event run?",
  goal: "What should attendees achieve by the end?"
};

@Injectable()
export class PromptBriefExtractorService {
  extract(prompt: string): ExtractedBrief {
    const normalized = prompt.trim().replace(/\s+/g, " ");
    const lower = normalized.toLowerCase();
    const eventType = this.extractEventType(lower);
    const mode = this.extractMode(lower);
    const durationMinutes = this.extractDurationMinutes(lower);
    const price = this.extractPrice(lower);

    const brief: ExtractedBrief = {
      eventType,
      topic: this.extractTopic(normalized, eventType),
      targetAudience: this.extractTargetAudience(normalized),
      mode,
      location: this.extractLocation(normalized, mode),
      dateTimeText: this.extractDateTimeText(normalized),
      durationMinutes,
      priceCents: price.priceCents,
      currency: price.currency,
      targetAttendees: this.extractTargetAttendees(lower),
      language: this.extractLanguage(lower),
      tone: this.extractTone(lower),
      goal: this.extractGoal(normalized),
      missingFields: [],
      missingQuestions: []
    };

    const missingFields = requiredFields.filter((field) => !brief[field]);
    brief.missingFields = missingFields;
    brief.missingQuestions = missingFields.map((field) => missingQuestionMap[field]).filter((question): question is string => Boolean(question));

    return brief;
  }

  private extractEventType(lower: string): EventType | null {
    const matches: Array<[string, EventType]> = [
      ["bootcamp", EventType.BOOTCAMP],
      ["webinar", EventType.WEBINAR],
      ["training", EventType.TRAINING],
      ["college fest", EventType.COLLEGE_FEST],
      ["fest", EventType.COLLEGE_FEST],
      ["orientation", EventType.ORIENTATION],
      ["paid class", EventType.PAID_CLASS],
      ["class", EventType.PAID_CLASS],
      ["meetup", EventType.MEETUP],
      ["workshop", EventType.WORKSHOP]
    ];

    return matches.find(([keyword]) => lower.includes(keyword))?.[1] ?? null;
  }

  private extractTopic(prompt: string, eventType: EventType | null): string | null {
    const firstSentence = prompt.split(/[.!?]/)[0]?.trim();
    if (!firstSentence) {
      return null;
    }

    const cleaned = firstSentence
      .replace(/^(please\s+)?(create|plan|organize|host|launch|run|set up|setup)\s+(an?\s+)?/i, "")
      .replace(/\s+(for|targeting|with)\s+.+$/i, "")
      .trim();

    if (cleaned.length >= 3) {
      return this.titleCase(cleaned.slice(0, 120));
    }

    return eventType ? this.titleCase(eventType.toLowerCase().replace(/_/g, " ")) : null;
  }

  private extractTargetAudience(prompt: string): string | null {
    return this.matchText(prompt, /\b(?:for|targeting|aimed at)\s+([^,.]+(?:students|professionals|faculty|employees|founders|developers|attendees|learners|teachers|teams)[^,.]*)/i);
  }

  private extractMode(lower: string): string | null {
    if (lower.includes("hybrid")) return "hybrid";
    if (lower.includes("online") || lower.includes("virtual") || lower.includes("zoom") || lower.includes("meet")) return "online";
    if (lower.includes("offline") || lower.includes("in-person") || lower.includes("venue") || lower.includes("campus")) return "offline";
    return null;
  }

  private extractLocation(prompt: string, mode: string | null): string | null {
    if (mode === "online") {
      return "Online";
    }

    return (
      this.matchText(prompt, /\b(?:at|in|venue:)\s+([A-Z][A-Za-z0-9\s,&-]{2,80})/) ??
      this.matchText(prompt, /\b(?:location:)\s+([^,.]+)/i)
    );
  }

  private extractDateTimeText(prompt: string): string | null {
    return (
      this.matchText(prompt, /\b(?:on|from|starting|scheduled for)\s+([^,.]+(?:am|pm|AM|PM|202\d|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^,.]*)/i) ??
      this.matchText(prompt, /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[^,.]*)/i)
    );
  }

  private extractDurationMinutes(lower: string): number | null {
    const match = lower.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|minute|minutes|min|mins|day|days)\b/);
    if (!match) {
      return null;
    }

    const amount = Number(match[1]);
    const unit = match[2]!;
    if (unit.startsWith("day")) return amount * 8 * 60;
    if (unit.startsWith("hour") || unit.startsWith("hr")) return Math.round(amount * 60);
    return Math.round(amount);
  }

  private extractPrice(lower: string) {
    if (/\bfree\b/.test(lower)) {
      return { priceCents: 0, currency: "INR" };
    }

    const rupeeMatch = lower.match(/(?:rs\.?|inr|₹)\s?([\d,]+)/i);
    if (rupeeMatch) {
      return { priceCents: Number(rupeeMatch[1]!.replace(/,/g, "")) * 100, currency: "INR" };
    }

    const dollarMatch = lower.match(/\$\s?([\d,]+)/);
    if (dollarMatch) {
      return { priceCents: Number(dollarMatch[1]!.replace(/,/g, "")) * 100, currency: "USD" };
    }

    return { priceCents: null, currency: "INR" };
  }

  private extractTargetAttendees(lower: string): number | null {
    const match = lower.match(/(\d{1,6})\s*(attendees|participants|students|seats|registrations|people)\b/);
    return match ? Number(match[1]) : null;
  }

  private extractLanguage(lower: string): string | null {
    if (lower.includes("hinglish")) return "Hinglish";
    if (lower.includes("hindi")) return "Hindi";
    if (lower.includes("english")) return "English";
    if (lower.includes("marathi")) return "Marathi";
    return null;
  }

  private extractTone(lower: string): string | null {
    const tones = ["professional", "friendly", "formal", "casual", "premium", "energetic", "academic"];
    return tones.find((tone) => lower.includes(tone)) ?? null;
  }

  private extractGoal(prompt: string): string | null {
    return (
      this.matchText(prompt, /\b(?:goal is to|objective is to|so that|to help|to teach|to enable)\s+([^,.]+)/i) ??
      this.matchText(prompt, /\b(?:goal:|objective:)\s+([^,.]+)/i)
    );
  }

  private matchText(prompt: string, pattern: RegExp): string | null {
    const value = prompt.match(pattern)?.[1]?.trim();
    return value && value.length > 1 ? value : null;
  }

  private titleCase(value: string) {
    return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
}
