import { Controller } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { QuestionsService } from 'src/questions/questions.service';

@Controller('answers')
export class AnswersController {
  constructor(
    private answerService: AnswersService,
    private questionService: QuestionsService,
  ) {}
}
