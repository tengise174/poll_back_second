import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DeleteQuestionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString()
  @ValidateNested({ each: true })
  ids: string[];
}
