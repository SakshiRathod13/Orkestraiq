import { IsEmail, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class SubmitRegistrationDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsEmail()
  @MaxLength(240)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsObject()
  responses!: Record<string, unknown>;
}
