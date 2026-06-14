import { Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateEventDto } from "./dto/create-event.dto.js";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findByOrganization(organizationId: string) {
    return this.prisma.event.findMany({
      where: { organizationId },
      orderBy: [{ startAt: "asc" }, { createdAt: "desc" }]
    });
  }

  async findOne(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        createdBy: true
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
}
