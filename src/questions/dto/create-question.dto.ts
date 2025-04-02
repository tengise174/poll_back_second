import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateOptionDto } from 'src/options/dto/create-option.dto';

enum QuestionType {
  MULTI_CHOICE = 'MULTI_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  RATING = 'RATING',
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
}
enum RateType {
  STAR = 'STAR',
  NUMBER = 'NUMBER',
}

export class CreateQuestionDto {
  @IsNotEmpty()
  content: string;

  @IsEnum(QuestionType)
  @IsOptional()
  @Transform(({ value }) => value || null)
  questionType: QuestionType;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || null)
  minAnswerCount: number;

  @IsEnum(RateType)
  @IsOptional()
  @Transform(({ value }) => value || null)
  rateType: RateType;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || null)
  rateNumber: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || null)
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];

  ///// dude
}
