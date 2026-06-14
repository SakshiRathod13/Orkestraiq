import { IsOptional, IsString, MaxLength } from "class-validator";

export class HumanReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reviewer?: string;
}
