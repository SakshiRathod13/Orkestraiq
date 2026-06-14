import { Injectable, NotFoundException } from "@nestjs/common";
import { EventBriefStatus, EventStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateEventDto } from "./dto/create-event.dto.js";
import { CreateEventFromPromptDto } from "./dto/create-event-from-prompt.dto.js";
import { SubmitRegistrationDto } from "./dto/submit-registration.dto.js";
import { UpdateEventBriefDto } from "./dto/update-event-brief.dto.js";
import { PromptBriefExtractorService } from "./prompt-brief-extractor.service.js";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractor: PromptBriefExtractorService
  ) {}

  findByOrganization(organizationId: string) {
    return this.prisma.event.findMany({
      where: { organizationId },
      include: { brief: true },
      orderBy: [{ startAt: "asc" }, { createdAt: "desc" }]
    });
  }

  async findOne(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        createdBy: true,
        brief: true,
        landingPage: true,
        registrationForm: true,
        attendees: {
          orderBy: { createdAt: "desc" },
          take: 50
        },
        _count: {
          select: { attendees: true }
        }
      }
    });

    if (!event) {
      throw new NotFoundException(`Event ${eventId} was not found.`);
    }

    return event;
  }

  async create(organizationId: string, dto: CreateEventDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} was not found.`);
    }

    const slug = await this.createUniqueSlug(organizationId, dto.title);
    const data = {
      organizationId,
      title: dto.title,
      slug,
      description: dto.description ?? null,
      type: dto.type ?? "WORKSHOP",
      status: EventStatus.DRAFT,
      timezone: dto.timezone ?? "Asia/Kolkata",
      startAt: dto.startAt ? new Date(dto.startAt) : null,
      endAt: dto.endAt ? new Date(dto.endAt) : null,
      venue: dto.venue ?? null,
      onlineUrl: dto.onlineUrl ?? null,
      audience: dto.audience ?? null,
      objective: dto.objective ?? null,
      capacity: dto.capacity ?? null,
      priceCents: dto.priceCents ?? null,
      currency: dto.currency ?? "INR"
    };

    return this.prisma.event.create({
      data
    });
  }

  async createFromPrompt(organizationId: string, dto: CreateEventFromPromptDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} was not found.`);
    }

    const extracted = this.extractor.extract(dto.prompt);
    const title = extracted.topic ?? "Untitled event brief";
    const slug = await this.createUniqueSlug(organizationId, title);

    return this.prisma.event.create({
      data: {
        organizationId,
        title,
        slug,
        description: dto.prompt,
        type: extracted.eventType ?? "OTHER",
        status: EventStatus.PLANNING,
        timezone: "Asia/Kolkata",
        venue: extracted.mode === "online" ? null : extracted.location,
        onlineUrl: null,
        audience: extracted.targetAudience,
        objective: extracted.goal,
        capacity: extracted.targetAttendees,
        priceCents: extracted.priceCents,
        currency: extracted.currency,
        brief: {
          create: {
            originalPrompt: dto.prompt,
            eventType: extracted.eventType,
            topic: extracted.topic,
            targetAudience: extracted.targetAudience,
            mode: extracted.mode,
            location: extracted.location,
            dateTimeText: extracted.dateTimeText,
            durationMinutes: extracted.durationMinutes,
            priceCents: extracted.priceCents,
            currency: extracted.currency,
            targetAttendees: extracted.targetAttendees,
            language: extracted.language,
            tone: extracted.tone,
            goal: extracted.goal,
            missingFields: extracted.missingFields,
            missingQuestions: extracted.missingQuestions
          }
        },
        landingPage: {
          create: this.buildLandingPageData({
            title,
            eventType: extracted.eventType ?? "OTHER",
            audience: extracted.targetAudience,
            goal: extracted.goal,
            priceCents: extracted.priceCents,
            currency: extracted.currency,
            dateTimeText: extracted.dateTimeText
          })
        },
        registrationForm: {
          create: this.buildRegistrationFormData(title)
        }
      },
      include: { brief: true, landingPage: true, registrationForm: true }
    });
  }

  async findBrief(eventId: string) {
    const brief = await this.prisma.eventBrief.findUnique({
      where: { eventId },
      include: { event: true }
    });

    if (!brief) {
      throw new NotFoundException(`Brief for event ${eventId} was not found.`);
    }

    return brief;
  }

  async updateBrief(eventId: string, dto: UpdateEventBriefDto) {
    await this.ensureEvent(eventId);
    const existingBrief = await this.prisma.eventBrief.findUnique({ where: { eventId } });

    if (!existingBrief) {
      throw new NotFoundException(`Brief for event ${eventId} was not found.`);
    }

    const patch = this.buildBriefPatch(dto);
    const completion = this.calculateCompletion({ ...existingBrief, ...patch });

    return this.prisma.eventBrief.update({
      where: { eventId },
      data: {
        ...patch,
        missingFields: completion.missingFields as Prisma.InputJsonValue,
        missingQuestions: completion.missingQuestions as Prisma.InputJsonValue
      }
    });
  }

  async approveBrief(eventId: string, dto: UpdateEventBriefDto) {
    const event = await this.ensureEvent(eventId);
    const existingBrief = await this.prisma.eventBrief.findUnique({ where: { eventId } });

    if (!existingBrief) {
      throw new NotFoundException(`Brief for event ${eventId} was not found.`);
    }

    const patch = this.buildBriefPatch(dto);
    const merged = { ...existingBrief, ...patch };
    const completion = this.calculateCompletion(merged);

    const brief = await this.prisma.eventBrief.update({
      where: { eventId },
      data: {
        ...patch,
        status: EventBriefStatus.APPROVED,
        missingFields: completion.missingFields as Prisma.InputJsonValue,
        missingQuestions: completion.missingQuestions as Prisma.InputJsonValue
      }
    });

    await this.prisma.event.update({
      where: { id: event.id },
      data: {
        title: brief.topic ?? event.title,
        type: brief.eventType ?? event.type,
        audience: brief.targetAudience,
        objective: brief.goal,
        venue: brief.mode === "online" ? null : brief.location,
        capacity: brief.targetAttendees,
        priceCents: brief.priceCents,
        currency: brief.currency,
        status: EventStatus.PLANNING
      }
    });

    return brief;
  }

  async generateLandingPage(eventId: string) {
    const event = await this.ensureEventWithBrief(eventId);
    return this.prisma.landingPage.upsert({
      where: { eventId },
      update: this.buildLandingPageData({
        title: event.title,
        eventType: event.type,
        audience: event.audience ?? event.brief?.targetAudience ?? null,
        goal: event.objective ?? event.brief?.goal ?? null,
        priceCents: event.priceCents ?? event.brief?.priceCents ?? null,
        currency: event.currency,
        dateTimeText: event.brief?.dateTimeText ?? null
      }),
      create: {
        eventId,
        ...this.buildLandingPageData({
          title: event.title,
          eventType: event.type,
          audience: event.audience ?? event.brief?.targetAudience ?? null,
          goal: event.objective ?? event.brief?.goal ?? null,
          priceCents: event.priceCents ?? event.brief?.priceCents ?? null,
          currency: event.currency,
          dateTimeText: event.brief?.dateTimeText ?? null
        })
      }
    });
  }

  async generateRegistrationForm(eventId: string) {
    const event = await this.ensureEvent(eventId);
    return this.prisma.registrationForm.upsert({
      where: { eventId },
      update: this.buildRegistrationFormData(event.title),
      create: {
        eventId,
        ...this.buildRegistrationFormData(event.title)
      }
    });
  }

  async findPublicEvent(orgSlug: string, eventSlug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        slug: eventSlug,
        organization: { slug: orgSlug }
      },
      include: {
        organization: true,
        landingPage: true,
        registrationForm: true,
        brief: true
      }
    });

    if (!event) {
      throw new NotFoundException(`Public event ${orgSlug}/${eventSlug} was not found.`);
    }

    return event;
  }

  async submitRegistration(orgSlug: string, eventSlug: string, dto: SubmitRegistrationDto) {
    const event = await this.prisma.event.findFirst({
      where: {
        slug: eventSlug,
        organization: { slug: orgSlug }
      },
      include: { registrationForm: true }
    });

    if (!event || !event.registrationForm) {
      throw new NotFoundException(`Registration for ${orgSlug}/${eventSlug} was not found.`);
    }

    return this.prisma.attendee.upsert({
      where: {
        eventId_email: {
          eventId: event.id,
          email: dto.email
        }
      },
      update: {
        name: dto.name,
        phone: dto.phone ?? null,
        responses: dto.responses as Prisma.InputJsonValue
      },
      create: {
        eventId: event.id,
        organizationId: event.organizationId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        responses: dto.responses as Prisma.InputJsonValue
      }
    });
  }

  async findAttendees(eventId: string) {
    await this.ensureEvent(eventId);
    return this.prisma.attendee.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" }
    });
  }

  private async createUniqueSlug(organizationId: string, title: string) {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const safeBase = base.length > 0 ? base : "event";
    let candidate = safeBase;
    let suffix = 1;

    while (
      await this.prisma.event.findUnique({
        where: {
          organizationId_slug: {
            organizationId,
            slug: candidate
          }
        }
      })
    ) {
      suffix += 1;
      candidate = `${safeBase}-${suffix}`;
    }

    return candidate;
  }

  private async ensureEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event ${eventId} was not found.`);
    }
    return event;
  }

  private async ensureEventWithBrief(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { brief: true }
    });
    if (!event) {
      throw new NotFoundException(`Event ${eventId} was not found.`);
    }
    return event;
  }

  private buildLandingPageData(input: {
    title: string;
    eventType: string;
    audience: string | null;
    goal: string | null;
    priceCents: number | null;
    currency: string;
    dateTimeText: string | null;
  }): Omit<Prisma.LandingPageCreateInput, "event"> {
    const audience = input.audience ?? "motivated learners";
    const goal = input.goal ?? "gain practical skills and confidence";
    const price = input.priceCents === 0 ? "Free" : input.priceCents ? `${input.currency} ${(input.priceCents / 100).toLocaleString("en-IN")}` : "Pricing to be announced";

    return {
      hero: {
        eyebrow: input.eventType.replace(/_/g, " "),
        title: input.title,
        subtitle: `A focused experience for ${audience}.`,
        dateTime: input.dateTimeText ?? "Date and time to be announced"
      },
      problem: {
        title: "Why this matters",
        body: `${audience} need a clear, guided path to ${goal}. This event is designed to turn intent into action.`
      },
      outcomes: {
        title: "Learning outcomes",
        items: ["Understand the core concepts", "Apply the ideas in a practical exercise", "Leave with a clear next step"]
      },
      agenda: {
        title: "Agenda",
        items: ["Welcome and context", "Core learning session", "Hands-on activity", "Q&A and next steps"]
      },
      speaker: {
        title: "Speaker",
        name: "Host to be announced",
        bio: "Speaker details will be added by the organizing team."
      },
      benefits: {
        title: "Benefits",
        items: ["Structured learning", "Practical examples", "Community access", "Actionable resources"]
      },
      certificate: {
        title: "Certificate",
        body: "Certificate details will be confirmed by the organizer."
      },
      pricing: {
        title: "Pricing",
        price
      },
      faqs: {
        title: "FAQs",
        items: [
          { question: "Who should attend?", answer: audience },
          { question: "What should I bring?", answer: "Bring curiosity, questions, and a device if the organizer requests one." },
          { question: "Will there be a recording?", answer: "Recording availability will be confirmed by the organizer." }
        ]
      },
      cta: {
        label: "Register now",
        body: "Reserve your spot and get event updates."
      }
    };
  }

  private buildRegistrationFormData(title: string): Omit<Prisma.RegistrationFormCreateInput, "event"> {
    return {
      title: `${title} registration`,
      description: "Share your details so the organizer can confirm your spot.",
      fields: [
        { key: "name", label: "Full name", type: "text", required: true },
        { key: "email", label: "Email address", type: "email", required: true },
        { key: "phone", label: "Phone number", type: "phone", required: false },
        { key: "organization", label: "College or organization", type: "text", required: false },
        { key: "expectation", label: "What do you want from this event?", type: "textarea", required: false }
      ] as Prisma.InputJsonValue
    };
  }

  private buildBriefPatch(dto: UpdateEventBriefDto): Prisma.EventBriefUpdateInput {
    const patch: Prisma.EventBriefUpdateInput = {};
    const fields = [
      "eventType",
      "topic",
      "targetAudience",
      "mode",
      "location",
      "dateTimeText",
      "durationMinutes",
      "priceCents",
      "currency",
      "targetAttendees",
      "language",
      "tone",
      "goal"
    ] as const;

    for (const field of fields) {
      if (dto[field] !== undefined) {
        patch[field] = dto[field];
      }
    }

    return patch;
  }

  private calculateCompletion(brief: Record<string, unknown>) {
    const fields = ["eventType", "topic", "targetAudience", "mode", "dateTimeText", "durationMinutes", "goal"];
    const questions: Record<string, string> = {
      eventType: "What type of event is this?",
      topic: "What is the main topic or title?",
      targetAudience: "Who is the target audience?",
      mode: "Will this be online, offline, or hybrid?",
      dateTimeText: "When should this event happen?",
      durationMinutes: "How long should the event run?",
      goal: "What should attendees achieve by the end?"
    };
    const missingFields = fields.filter((field) => !brief[field as keyof UpdateEventBriefDto]);

    return {
      missingFields,
      missingQuestions: missingFields.map((field) => questions[field]).filter((question): question is string => Boolean(question))
    };
  }
}
