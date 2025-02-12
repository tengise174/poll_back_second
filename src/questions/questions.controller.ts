import { Controller, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('questions')
@UseGuards(AuthGuard())
export class QuestionsController {
  constructor(private questionService: QuestionsService) {}
}
