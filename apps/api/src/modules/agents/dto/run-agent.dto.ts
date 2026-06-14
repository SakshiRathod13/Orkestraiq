import { IsOptional, IsString, MaxLength } from "class-validator";

export class RunAgentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}
