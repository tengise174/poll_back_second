import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './answer.entity';
import { In, Repository } from 'typeorm';
import { Question } from 'src/questions/question.entity';
import { Option } from 'src/option/options.entity';
import { Poll } from 'src/polls/poll.entity';
import { User } from 'src/auth/user.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
  ) {}

  async createAnswer(
    user: User,
    createAnswerDto: CreateAnswerDto,
  ): Promise<Answer> {
    const { questionId, optionIds, textAnswer } = createAnswerDto;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['poll'],
    });
    if (!question) throw new BadRequestException('Question not found');

    switch (question.questionType) {
      case 'SINGLE_CHOICE':
        if (optionIds?.length > 1) {
          throw new BadRequestException(
            'Only one option allowed for SINGLE_CHOICE',
          );
        }
        if (!optionIds?.length) {
          throw new BadRequestException('Option required for SINGLE_CHOICE');
        }
        break;
      case 'MULTI_CHOICE':
        if (
          question.minAnswerCount &&
          optionIds?.length < question.minAnswerCount
        ) {
          throw new BadRequestException(
            `At least ${question.minAnswerCount} options required for MULTI_CHOICE`,
          );
        }
        break;
      case 'TEXT':
        if (!textAnswer) {
          throw new BadRequestException(
            'Text answer required for TEXT question',
          );
        }
        break;
      case 'YES_NO':
        if (!textAnswer && !optionIds?.length) {
          throw new BadRequestException('Answer required for YES_NO question');
        }
        break;
      case 'RATING':
        if (!textAnswer) {
          throw new BadRequestException(
            'Rating value required for RATING question',
          );
        }
        if (optionIds?.length) {
          throw new BadRequestException(
            'Options not allowed for RATING question',
          );
        }
        const ratingValue = parseInt(textAnswer, 10);
        if (
          isNaN(ratingValue) ||
          ratingValue < 1 ||
          ratingValue > question.rateNumber
        ) {
          throw new BadRequestException(
            `Rating must be a number between 1 and ${question.rateNumber}`,
          );
        }
        break;
      default:
        throw new BadRequestException('Invalid question type');
    }

    const existingAnswer = await this.answerRepository.findOne({
      where: { user: { id: user.id }, question: { id: questionId } },
    });
    if (existingAnswer) {
      throw new BadRequestException('You have already answered this question');
    }

    const answer = this.answerRepository.create({
      user,
      poll: question.poll,
      question,
      textAnswer,
    });

    if (optionIds?.length && question.questionType !== 'RATING') {
      const options = await this.optionRepository.findBy({ id: In(optionIds) });
      if (options.length !== optionIds.length) {
        throw new BadRequestException('Invalid option IDs');
      }
      const validOptions = options.every(
        (opt) => opt.question.id === questionId,
      );
      if (!validOptions) {
        throw new BadRequestException('Options must belong to this question');
      }
      answer.options = options;
    }
    //// git check

    return this.answerRepository.save(answer);
  }

  async hasCompletedPoll(user: User, pollId: string): Promise<boolean> {
    // Fetch the poll with its questions
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions'],
    });
    if (!poll) throw new NotFoundException('Poll not found');

    const totalQuestions = poll.questions.length;
    if (totalQuestions === 0) return true; // No questions = completed

    // Count distinct questions answered by the user for this poll
    const answeredQuestions = await this.answerRepository
      .createQueryBuilder('answer')
      .where('answer.user = :userId', { userId: user.id })
      .andWhere('answer.poll = :pollId', { pollId })
      .select('DISTINCT answer.question')
      .getRawMany();

    const answeredCount = answeredQuestions.length;
    return answeredCount >= totalQuestions;
  }
}
