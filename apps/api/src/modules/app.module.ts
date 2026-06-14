import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module.js";
import { HealthModule } from "./health/health.module.js";
import { OrganizationsModule } from "./organizations/organizations.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, HealthModule, OrganizationsModule, EventsModule]
})
export class AppModule {}
