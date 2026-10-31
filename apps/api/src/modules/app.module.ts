import { Module } from "@nestjs/common";
import { AgentsModule } from "./agents/agents.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { EventsModule } from "./events/events.module.js";
import { HealthModule } from "./health/health.module.js";
import { OrganizationsModule } from "./organizations/organizations.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, OrganizationsModule, EventsModule, AgentsModule]
})
export class AppModule {}
