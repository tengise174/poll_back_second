import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { CreateAnswerDto } from './dto/create-anwer.dto';
import { Question } from 'src/questions/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async createAnswer(
    createAnswerDto: CreateAnswerDto,
    question: Question,
  ): Promise<Answer> {
    const answer = this.answerRepository.create(createAnswerDto);
    answer.question = question;
    return this.answerRepository.save(answer);
  }

  async createAnswers(createAnswersDto: CreateAnswerDto[], question: Question) {
    const answers = createAnswersDto.map((dto) => {
      const answer = this.answerRepository.create(dto);
      answer.question = question;
      return answer;
    });
    return this.answerRepository.save(answers);
  }

  async getAnswers(question: Question) {
    return this.answerRepository.find({ where: question });
  }
}
