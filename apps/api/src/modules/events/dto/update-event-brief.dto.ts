import { EventType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  MaxLength,
  Min
} from "class-validator";

export class UpdateEventBriefDto {
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsString()
  @Length(3, 160)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  mode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  dateTimeText?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100000)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100000)
  targetAttendees?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  goal?: string;

  @IsOptional()
  @IsBoolean()
  approve?: boolean;
}
