import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => value || null)
  order: number;
}
