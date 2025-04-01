import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsUUID()
  questionId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  optionIds?: string[];

  @IsString()
  @IsOptional()
  textAnswer?: string;
}
