import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/public.decorator.js";

@Controller("health")
export class HealthController {
  @Get()
  @Public()
  getHealth() {
    return {
      status: "ok",
      service: "orchestraiq-api",
      timestamp: new Date().toISOString()
    };
  }
}
