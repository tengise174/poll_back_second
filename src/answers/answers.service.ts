import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './answers.entity';
import { Question } from 'src/questions/question.entity';
import { In, Repository } from 'typeorm';
import { Option } from 'src/options/options.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
  ) {}

  async saveAnswers(dtos: CreateAnswerDto[], user: User) {
    const answers: Answer[] = [];

    for (const dto of dtos) {
      if (!dto.questionId || (!dto.optionIds && !dto.textAnswer)) {
        // Skip invalid answers or log an error
        console.warn('Skipping invalid answer:', dto);
        continue;
      }

      const question = await this.questionRepository.findOne({
        where: { id: dto.questionId },
      });
      if (!question) throw new Error(`Question ${dto.questionId} not found`);
      const answer = new Answer();
      answer.user = user;
      answer.question = question;

      // Handle optionIds
      if (dto.optionIds && dto.optionIds.length > 0) {
        const options = await this.optionRepository.findBy({
          id: In(dto.optionIds),
        });
        if (options.length !== dto.optionIds.length) {
          throw new Error(
            `Some options for question ${dto.questionId} not found`,
          );
        }
        answer.selectedOptions = options;
      } else {
        answer.selectedOptions = [];
      }

      // Handle textAnswer
      if (dto.textAnswer) {
        answer.textAnswer = dto.textAnswer;
      }

      answers.push(answer);
    }

    // Save answers
    return this.answerRepository.save(answers);
  }
}
