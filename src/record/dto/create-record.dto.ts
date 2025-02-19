import { IsString } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  id: string;
}
