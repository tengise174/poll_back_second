import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || null)
  order: number;
}
