import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AuthenticatedUser } from "./auth.types.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "orchestraiq_session";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException("An account with that email already exists.");

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash: await this.hashPassword(dto.password),
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: dto.organizationName?.trim() || `${dto.name.trim()}'s organization`,
                slug: await this.createOrganizationSlug(dto.organizationName?.trim() || dto.name.trim())
              }
            }
          }
        }
      },
      select: { id: true, email: true, name: true }
    });
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user?.passwordHash || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  async getUserFromToken(token?: string): Promise<AuthenticatedUser> {
    if (!token) throw new UnauthorizedException("Sign in is required.");
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature || !this.verifySignature(encodedPayload, signature)) {
      throw new UnauthorizedException("Your session is invalid or expired.");
    }
    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as { sub: string; exp: number };
      if (!payload.sub || payload.exp < Date.now()) throw new Error("expired");
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true } });
      if (!user) throw new Error("missing user");
      return user;
    } catch {
      throw new UnauthorizedException("Your session is invalid or expired.");
    }
  }

  createSessionToken(user: AuthenticatedUser) {
    const days = Number(process.env.AUTH_SESSION_DAYS ?? 7);
    const encodedPayload = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + days * 86400000 })).toString("base64url");
    return `${encodedPayload}.${this.sign(encodedPayload)}`;
  }

  getCookieName() { return sessionCookieName; }

  async assertOrganizationAccess(userId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { role: true }
    });
    if (!membership) throw new UnauthorizedException("You do not have access to this organization.");
    return membership;
  }

  async assertEventAccess(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, select: { organizationId: true } });
    if (!event) throw new UnauthorizedException("This event is unavailable.");
    await this.assertOrganizationAccess(userId, event.organizationId);
    return event;
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  private async verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hash, "hex");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  private sign(value: string) { return createHmac("sha256", this.getSecret()).update(value).digest("base64url"); }
  private verifySignature(value: string, signature: string) {
    const expected = this.sign(value);
    return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
  private getSecret() {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret === "replace-with-a-long-random-string") throw new Error("AUTH_SECRET must be configured.");
    return secret;
  }
  private async createOrganizationSlug(seed: string) {
    const base = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "organization";
    let slug = base;
    let suffix = 1;
    while (await this.prisma.organization.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${suffix++}`;
    return slug;
  }
}
