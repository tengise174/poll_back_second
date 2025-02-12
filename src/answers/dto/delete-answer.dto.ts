import { IsNotEmpty } from 'class-validator';

export class DeleteAnswerDto {
  @IsNotEmpty()
  id: string;
}
