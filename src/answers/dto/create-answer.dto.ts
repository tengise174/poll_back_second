import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  questionId: string;

  @IsArray()
  @IsOptional()
  optionIds?: string[];

  @IsString()
  @IsOptional()
  textAnswer?: string;
}
