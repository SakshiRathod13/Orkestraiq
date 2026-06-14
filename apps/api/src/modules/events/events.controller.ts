import { Controller, Get, Param } from "@nestjs/common";
import { EventsService } from "./events.service.js";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(":eventId")
  findOne(@Param("eventId") eventId: string) {
    return this.eventsService.findOne(eventId);
  }
}
