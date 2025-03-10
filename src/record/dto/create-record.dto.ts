import { IsString } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  questionId: string;

  @IsString()
  answerId: string;
}
