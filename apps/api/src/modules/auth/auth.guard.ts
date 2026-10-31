import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const bearer = typeof authorization === "string" ? authorization.replace(/^Bearer\s+/i, "") : undefined;
    const cookie = typeof request.headers.cookie === "string" ? request.headers.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${this.authService.getCookieName()}=`))?.split("=").slice(1).join("=") : undefined;
    request.user = await this.authService.getUserFromToken(bearer ?? cookie);
    return true;
  }
}
