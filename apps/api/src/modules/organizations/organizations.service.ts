import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            events: true,
            members: true
          }
        }
      }
    });
  }

  async findOne(orgId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      }
    });

    if (!organization) {
      throw new NotFoundException(`Organization ${orgId} was not found.`);
    }

    return organization;
  }
}
