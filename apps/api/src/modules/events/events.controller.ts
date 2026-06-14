import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { SubmitRegistrationDto } from "./dto/submit-registration.dto.js";
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

  @Get(":eventId/attendees")
  findAttendees(@Param("eventId") eventId: string) {
    return this.eventsService.findAttendees(eventId);
  }

  @Post(":eventId/landing-page/generate")
  generateLandingPage(@Param("eventId") eventId: string) {
    return this.eventsService.generateLandingPage(eventId);
  }

  @Post(":eventId/registration-form/generate")
  generateRegistrationForm(@Param("eventId") eventId: string) {
    return this.eventsService.generateRegistrationForm(eventId);
  }

  @Get("public/:orgSlug/:eventSlug")
  findPublicEvent(@Param("orgSlug") orgSlug: string, @Param("eventSlug") eventSlug: string) {
    return this.eventsService.findPublicEvent(orgSlug, eventSlug);
  }

  @Post("public/:orgSlug/:eventSlug/register")
  submitRegistration(
    @Param("orgSlug") orgSlug: string,
    @Param("eventSlug") eventSlug: string,
    @Body() dto: SubmitRegistrationDto
  ) {
    return this.eventsService.submitRegistration(orgSlug, eventSlug, dto);
  }
}
