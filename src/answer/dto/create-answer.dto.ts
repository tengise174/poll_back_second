import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  questionId: string;

  @IsArray()
  @IsOptional()
  optionIds?: string[];

  @IsString()
  @IsOptional()
  textAnswer?: string;
}
