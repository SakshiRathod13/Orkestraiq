import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ReviewMarketingDraftDto } from "./dto/review-marketing-draft.dto.js";
import { SubmitRegistrationDto } from "./dto/submit-registration.dto.js";
import { UpdateEventBriefDto } from "./dto/update-event-brief.dto.js";
import { EventsService } from "./events.service.js";
import { AuthService } from "../auth/auth.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { Public } from "../auth/public.decorator.js";
import type { AuthenticatedUser } from "../auth/auth.types.js";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService, private readonly authService: AuthService) {}

  @Get("public/:orgSlug/:eventSlug")
  @Public()
  findPublicEvent(@Param("orgSlug") orgSlug: string, @Param("eventSlug") eventSlug: string) {
    return this.eventsService.findPublicEvent(orgSlug, eventSlug);
  }

  @Post("public/:orgSlug/:eventSlug/register")
  @Public()
  submitRegistration(
    @Param("orgSlug") orgSlug: string,
    @Param("eventSlug") eventSlug: string,
    @Body() dto: SubmitRegistrationDto
  ) {
    return this.eventsService.submitRegistration(orgSlug, eventSlug, dto);
  }

  @Get(":eventId")
  async findOne(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.findOne(eventId);
  }

  @Get(":eventId/brief")
  async findBrief(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.findBrief(eventId);
  }

  @Patch(":eventId/brief")
  async updateBrief(@Param("eventId") eventId: string, @Body() dto: UpdateEventBriefDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.updateBrief(eventId, dto);
  }

  @Post(":eventId/brief/approve")
  async approveBrief(@Param("eventId") eventId: string, @Body() dto: UpdateEventBriefDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.approveBrief(eventId, dto);
  }

  @Get(":eventId/attendees")
  async findAttendees(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.findAttendees(eventId);
  }

  @Get(":eventId/analytics")
  async getAnalytics(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.getAnalytics(eventId);
  }

  @Post(":eventId/landing-page/generate")
  async generateLandingPage(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.generateLandingPage(eventId);
  }

  @Post(":eventId/registration-form/generate")
  async generateRegistrationForm(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.generateRegistrationForm(eventId);
  }

  @Post(":eventId/marketing/generate")
  async generateMarketingDraft(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.generateMarketingDraft(eventId);
  }

  @Post(":eventId/marketing/approve")
  async approveMarketingDraft(@Param("eventId") eventId: string, @Body() dto: ReviewMarketingDraftDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.approveMarketingDraft(eventId, dto);
  }

  @Post(":eventId/marketing/reject")
  async rejectMarketingDraft(@Param("eventId") eventId: string, @Body() dto: ReviewMarketingDraftDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.eventsService.rejectMarketingDraft(eventId, dto);
  }
}
