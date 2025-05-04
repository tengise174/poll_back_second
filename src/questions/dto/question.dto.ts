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
import { OptionDto } from 'src/options/dto/option.dto';

export enum QuestionType {
  MULTI_CHOICE = 'MULTI_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  RATING = 'RATING',
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  MULTIPLE_CHOICE_GRID = 'MULTIPLE_CHOICE_GRID',
  TICK_BOX_GRID = 'TICK_BOX_GRID',
  LINEAR_SCALE = 'LINEAR_SCALE',
  DATE = 'DATE',
  TIME = 'TIME',
  RANKING = 'RANKING',
}

export enum RateType {
  STAR = 'STAR',
  NUMBER = 'NUMBER',
}

export class QuestionDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === null ? null : value))
  id?: string | null;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(QuestionType)
  @Transform(({ value }) => value || null)
  questionType?: QuestionType;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  minAnswerCount?: number;

  @IsOptional()
  @IsEnum(RateType)
  @Transform(({ value }) => value || null)
  rateType?: RateType;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  rateNumber?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  order?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  isPointBased?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCorrectAnswer?: boolean;

  @IsOptional()
  @IsString()
  poster?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gridRows?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gridColumns?: string[];

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsString()
  minLabel?: string;

  @IsOptional()
  @IsString()
  maxLabel?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}