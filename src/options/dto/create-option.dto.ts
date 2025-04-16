import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  content: string;

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
}
