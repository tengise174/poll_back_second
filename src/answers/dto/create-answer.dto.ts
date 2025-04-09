import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  questionId: string;

  @IsArray()
  @IsOptional()
  optionIds?: string[];

  @IsString()
  @IsOptional()
  textAnswer?: string;

  @IsNumber()
  @IsOptional()
  timeTaken?: number;
}
