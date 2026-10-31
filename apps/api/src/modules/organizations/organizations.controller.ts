import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateEventDto } from "../events/dto/create-event.dto.js";
import { CreateEventFromPromptDto } from "../events/dto/create-event-from-prompt.dto.js";
import { EventsService } from "../events/events.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { AuthService } from "../auth/auth.service.js";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { OrganizationsService } from "./organizations.service.js";

@Controller("organizations")
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findAll(user.id);
  }

  @Get(":orgId")
  async findOne(@Param("orgId") orgId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertOrganizationAccess(user.id, orgId);
    return this.organizationsService.findOne(orgId);
  }

  @Get(":orgId/events")
  async findEvents(@Param("orgId") orgId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertOrganizationAccess(user.id, orgId);
    return this.eventsService.findByOrganization(orgId);
  }

  @Post(":orgId/events")
  async createEvent(@Param("orgId") orgId: string, @Body() dto: CreateEventDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertOrganizationAccess(user.id, orgId);
    return this.eventsService.create(orgId, dto, user.id);
  }

  @Post(":orgId/events/from-prompt")
  async createEventFromPrompt(@Param("orgId") orgId: string, @Body() dto: CreateEventFromPromptDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertOrganizationAccess(user.id, orgId);
    return this.eventsService.createFromPrompt(orgId, dto, user.id);
  }
}
