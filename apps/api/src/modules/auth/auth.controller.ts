import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { CurrentUser } from "./current-user.decorator.js";
import { Public } from "./public.decorator.js";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedUser } from "./auth.types.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";

type CookieResponse = {
  cookie(name: string, value: string, options: Record<string, unknown>): void;
  clearCookie(name: string, options: Record<string, unknown>): void;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: CookieResponse) {
    const user = await this.authService.register(dto);
    this.setSession(response, user);
    return { user };
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: CookieResponse) {
    const user = await this.authService.login(dto);
    this.setSession(response, user);
    return { user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: CookieResponse) {
    response.clearCookie(this.authService.getCookieName(), { httpOnly: true, sameSite: "lax" });
    return { ok: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) { return { user }; }

  private setSession(response: CookieResponse, user: AuthenticatedUser) {
    response.cookie(this.authService.getCookieName(), this.authService.createSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.AUTH_SESSION_DAYS ?? 7) * 86400000,
      path: "/"
    });
  }
}
