import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { UpdateEventBriefDto } from "./dto/update-event-brief.dto.js";
import { EventsService } from "./events.service.js";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(":eventId")
  findOne(@Param("eventId") eventId: string) {
    return this.eventsService.findOne(eventId);
  }

  @Get(":eventId/brief")
  findBrief(@Param("eventId") eventId: string) {
    return this.eventsService.findBrief(eventId);
  }

  @Patch(":eventId/brief")
  updateBrief(@Param("eventId") eventId: string, @Body() dto: UpdateEventBriefDto) {
    return this.eventsService.updateBrief(eventId, dto);
  }

  @Post(":eventId/brief/approve")
  approveBrief(@Param("eventId") eventId: string, @Body() dto: UpdateEventBriefDto) {
    return this.eventsService.approveBrief(eventId, dto);
  }
}
