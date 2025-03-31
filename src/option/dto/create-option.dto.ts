import { IsNotEmpty } from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  content: string;
}
