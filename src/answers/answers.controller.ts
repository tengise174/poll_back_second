import { Body, Controller, Param, Post } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { QuestionsService } from 'src/questions/questions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from 'src/questions/question.entity';
import { CreateAnswerDto } from './dto/create-anwer.dto';

@Controller('answers')
export class AnswersController {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private answerService: AnswersService,
    private questionService: QuestionsService,
  ) {}

  @Post(':id')
  async createAnswer(
    @Param('id') questionId: string,
    @Body() createAnswersDto: CreateAnswerDto[],
  ) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    this.answerService.createAnswers(createAnswersDto, question);
  }
}
