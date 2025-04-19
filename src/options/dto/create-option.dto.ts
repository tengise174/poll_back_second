import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOptionDto {

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || null)
  order: number;

  @IsString()
  @IsOptional()
  poster?: string | null;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  nextQuestionOrder?: number | null;

  @IsNumber()
  @IsOptional()
  rowIndex?: number | null;

  @IsNumber()
  @IsOptional()
  columnIndex?: number | null;
}
