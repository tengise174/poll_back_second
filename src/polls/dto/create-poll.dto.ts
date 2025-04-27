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

class PollsterDto {
  @IsString()
  username: string;
}

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
  isShowUser: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value || null)
  isHasEnterCode: boolean;

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
  duration: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  enterCode: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  pollsterNumber: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value || null)
  themeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PollsterDto)
  pollsters: PollsterDto[];

  @IsString()
  @IsOptional()
  poster?: string | null;
}
