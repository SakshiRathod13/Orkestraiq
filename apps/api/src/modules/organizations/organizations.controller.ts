import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateEventDto } from "../events/dto/create-event.dto.js";
import { CreateEventFromPromptDto } from "../events/dto/create-event-from-prompt.dto.js";
import { EventsService } from "../events/events.service.js";
import { OrganizationsService } from "./organizations.service.js";

@Controller("organizations")
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly eventsService: EventsService
  ) {}

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(":orgId")
  findOne(@Param("orgId") orgId: string) {
    return this.organizationsService.findOne(orgId);
  }

  @Get(":orgId/events")
  findEvents(@Param("orgId") orgId: string) {
    return this.eventsService.findByOrganization(orgId);
  }

  @Post(":orgId/events")
  createEvent(@Param("orgId") orgId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(orgId, dto);
  }

  @Post(":orgId/events/from-prompt")
  createEventFromPrompt(@Param("orgId") orgId: string, @Body() dto: CreateEventFromPromptDto) {
    return this.eventsService.createFromPrompt(orgId, dto);
  }
}
