import { IsOptional, IsString, MaxLength } from "class-validator";

export class ReviewMarketingDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reviewer?: string;
}
