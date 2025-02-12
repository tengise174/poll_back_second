import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { AnswersService } from 'src/answers/answers.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Poll } from 'src/polls/poll.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private answerService: AnswersService,
  ) {}

  async createQuestion(
    poll: Poll,
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const question = this.questionRepository.create(createQuestionDto);
    question.poll = poll;
    const savedQuestion = await this.questionRepository.save(question);
    question.answers.map((dto) =>
      this.answerService.createAnswer(dto, savedQuestion),
    );
    return savedQuestion;
  }

  async getQuestions(poll: Poll) {
    this.questionRepository.find({ where: poll });
  }
}
