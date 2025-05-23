import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOptionDto } from 'src/options/dto/create-option.dto';

enum QuestionType {
  MULTI_CHOICE = 'MULTI_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  RATING = 'RATING',
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  MULTIPLE_CHOICE_GRID = 'MULTIPLE_CHOICE_GRID',
  TICK_BOX_GRID = "TICK_BOX_GRID",
  LINEAR_SCALE = "LINEAR_SCALE",
  DATE = "DATE",
  TIME = "TIME",
  RANKING = "RANKING",
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

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsBoolean()
  @IsOptional()
  isPointBased?: boolean;

  @IsBoolean()
  @IsOptional()
  hasCorrectAnswer: boolean;

  @IsString()
  @IsOptional()
  poster?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gridRows: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gridColumns: string[];

  @IsNumber()
  @IsOptional()
  minValue?: number;

  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @IsString()
  @IsOptional()
  minLabel?: string;

  @IsString()
  @IsOptional()
  maxLabel?: string;
}

