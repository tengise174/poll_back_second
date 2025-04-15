import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
