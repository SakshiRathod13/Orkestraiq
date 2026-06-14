import { Injectable, NotFoundException } from "@nestjs/common";
import { EventBriefStatus, EventStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateEventDto } from "./dto/create-event.dto.js";
import { CreateEventFromPromptDto } from "./dto/create-event-from-prompt.dto.js";
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
        brief: true
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
        }
      },
      include: { brief: true }
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
