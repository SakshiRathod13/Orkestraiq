import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller.js";
import { EventsService } from "./events.service.js";
import { PromptBriefExtractorService } from "./prompt-brief-extractor.service.js";

@Module({
  controllers: [EventsController],
  providers: [EventsService, PromptBriefExtractorService],
  exports: [EventsService]
})
export class EventsModule {}
