import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class OptionDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === null ? null : value))
  id?: string | null;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  order?: number;

  @IsOptional()
  @IsString()
  poster?: string | null;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  nextQuestionOrder?: number | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  rowIndex?: number | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  columnIndex?: number | null;
}