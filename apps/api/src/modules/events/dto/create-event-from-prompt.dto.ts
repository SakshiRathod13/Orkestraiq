import { IsString, Length } from "class-validator";

export class CreateEventFromPromptDto {
  @IsString()
  @Length(20, 5000)
  prompt!: string;
}
