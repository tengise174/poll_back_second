import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateQuestionDto } from 'src/questions/dto/create-question.dto';

export class CreatePollDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  greetingMessage: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  btnLabel: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  endTitle: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || null)
  thankYouMessage: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value || null)
  isAccessLevel: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value || null)
  isTimeSelected: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value || null)
  isDuration: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value || null)
  isPollsterNumber: boolean;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value || null)
  startDate: string;

  @IsOptional()
  @Transform(({ value }) => value || null)
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  duration: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  pollsterNumber: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  themeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
