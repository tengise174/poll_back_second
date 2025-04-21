import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './answers.entity';
import { Question } from 'src/questions/question.entity';
import { In, Repository } from 'typeorm';
import { Option } from 'src/options/options.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { User } from 'src/auth/user.entity';
import { Poll } from 'src/polls/poll.entity';
import { QuestionType } from 'src/questions/question.entity';

export interface PollAnswerDetails {
  poll: Poll;
  questions: {
    questionId: string;
    content: string;
    questionType: QuestionType;
    selectedOptions: { id: string; content: string }[];
    textAnswer: string | null;
    allOptions: { id: string; content: string }[];
  }[];
  message?: string;
}

@Injectable()
export class AnswersService {
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

  async saveAnswers(dtos: CreateAnswerDto[], user: User): Promise<Answer[]> {
    const answers: Answer[] = [];

    for (const dto of dtos) {
      if (!dto.questionId || (!dto.optionIds && !dto.textAnswer)) {
        console.warn('Skipping invalid answer:', dto);
        continue;
      }

      const question = await this.questionRepository.findOne({
        where: { id: dto.questionId },
      });
      if (!question) {
        throw new Error(`Question ${dto.questionId} not found`);
      }

      const answer = new Answer();
      answer.user = user;
      answer.question = question;

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

      if (dto.textAnswer) {
        answer.textAnswer = dto.textAnswer;
      }

      if (dto.timeTaken !== undefined) {
        answer.timeTaken = dto.timeTaken;
      }

      answers.push(answer);
    }

    return this.answerRepository.save(answers);
  }

  async getUserAnsweredPolls(user: User): Promise<Poll[]> {
    const answeredPolls = await this.answerRepository.find({
      where: { user: { id: user.id } },
      relations: ['question', 'question.poll'],
      select: ['id', 'createdAt'],
    });

    const failedPolls = await this.pollRepository.find({
      where: { failedAttendees: { id: user.id } },
      select: [
        'id',
        'title',
        'greetingMessage',
        'startDate',
        'endDate',
        'createdAt',
      ],
      relations: ['failedAttendees'],
    });

    const pollsMap = new Map<string, Poll>();

    answeredPolls.forEach((answer) => {
      const poll = answer.question.poll;
      if (poll && !pollsMap.has(poll.id)) {
        pollsMap.set(poll.id, {
          id: poll.id,
          title: poll.title,
          greetingMessage: poll.greetingMessage,
          startDate: poll.startDate,
          endDate: poll.endDate,
          createdAt: poll.createdAt,
          poster: poll.poster,
          hasAnswers: true,
        } as unknown as Poll);
      }
    });

    failedPolls.forEach((poll) => {
      if (!pollsMap.has(poll.id)) {
        pollsMap.set(poll.id, {
          id: poll.id,
          title: poll.title,
          greetingMessage: poll.greetingMessage,
          startDate: poll.startDate,
          endDate: poll.endDate,
          createdAt: poll.createdAt,
          poster: poll.poster,
          hasAnswers: false,
        } as unknown as Poll);
      }
    });

    return Array.from(pollsMap.values());
  }

  async getPollAnswerDetails(
    pollId: string,
    user: User,
  ): Promise<PollAnswerDetails> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      select: [
        'id',
        'title',
        'greetingMessage',
        'startDate',
        'endDate',
        'themeId',
        'createdAt',
        'poster',
      ],
      relations: ['failedAttendees'],
    });

    if (!poll) {
      throw new Error(`Poll ${pollId} not found`);
    }

    const answers = await this.answerRepository.find({
      where: {
        user: { id: user.id },
        question: { poll: { id: pollId } },
      },
      relations: ['question', 'selectedOptions'],
      select: ['id', 'textAnswer', 'createdAt'],
    });

    const questions = await this.questionRepository.find({
      where: { poll: { id: pollId } },
      relations: ['options'],
      select: ['id', 'content', 'questionType', 'rateNumber', 'rateType', 'poster', 'isPointBased', 'hasCorrectAnswer', 'gridColumns', 'gridRows', 'minValue', 'maxValue', 'minLabel', 'maxLabel'],
    });

    const isFailedAttendee = poll.failedAttendees.some(
      (attendee) => attendee.id === user.id,
    );

    const questionDetails = questions.map((question) => {
      const userAnswer = answers.find(
        (answer) => answer.question.id === question.id,
      );

      return {
        questionId: question.id,
        content: question.content,
        questionType: question.questionType,
        rateNumber: question.rateNumber,
        rateType: question.rateType,
        poster: question.poster,
        isPointBased: question.isPointBased,
        hasCorrectAnswer: question.hasCorrectAnswer,
        gridColumns: question.gridColumns,
        gridRows: question.gridRows,
        minValue: question.minValue,
        maxValue: question.maxValue,
        minLabel: question.minLabel,
        maxLabel: question.maxLabel,
        allOptions:
          question.options?.map((option) => ({
            id: option.id,
            content: option.content,
            poster: option.poster,
            points: option.points,
            order: option.order,
            isCorrect: option.isCorrect,
            nextQuestionOrder: option.nextQuestionOrder,
            rowIndex: option.rowIndex,
            columnIndex: option.columnIndex,
          })) || [],
        selectedOptions:
          userAnswer?.selectedOptions?.map((option) => ({
            id: option.id,
            content: option.content,
          })) || [],
        textAnswer: userAnswer?.textAnswer || null,
      };
    });

    let message: string | undefined;
    if (answers.length === 0) {
      message = isFailedAttendee
        ? 'You attended this poll but did not submit answers'
        : 'You have not submitted answers for this poll';
    }

    return {
      poll,
      questions: questionDetails,
      message,
    };
  }
}
