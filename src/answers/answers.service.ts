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
    // Fetch polls where the user has submitted answers
    const answeredPolls = await this.answerRepository.find({
      where: { user: { id: user.id } },
      relations: ['question', 'question.poll'],
      select: ['id', 'createdAt'],
    });

    // Fetch polls where the user is in failedAttendees
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

    // Add answered polls
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
          hasAnswers: true,
        } as unknown as Poll);
      }
    });

    // Add failed polls (if not already added)
    failedPolls.forEach((poll) => {
      if (!pollsMap.has(poll.id)) {
        pollsMap.set(poll.id, {
          id: poll.id,
          title: poll.title,
          greetingMessage: poll.greetingMessage,
          startDate: poll.startDate,
          endDate: poll.endDate,
          createdAt: poll.createdAt,
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
    // Step 1: Fetch the poll with basic details and failedAttendees
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
      ],
      relations: ['failedAttendees'],
    });

    if (!poll) {
      throw new Error(`Poll ${pollId} not found`);
    }

    // Step 2: Fetch user's answers for this poll
    const answers = await this.answerRepository.find({
      where: {
        user: { id: user.id },
        question: { poll: { id: pollId } },
      },
      relations: ['question', 'selectedOptions'],
      select: ['id', 'textAnswer', 'createdAt'],
    });

    // Step 3: Fetch all questions for the poll with their options
    const questions = await this.questionRepository.find({
      where: { poll: { id: pollId } },
      relations: ['options'],
      select: ['id', 'content', 'questionType', 'rateNumber', 'rateType'],
    });

    // Step 4: Check if user is a failed attendee
    const isFailedAttendee = poll.failedAttendees.some(
      (attendee) => attendee.id === user.id,
    );

    // Step 5: Map questions with all options, including answers if they exist
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
        allOptions:
          question.options?.map((option) => ({
            id: option.id,
            content: option.content,
          })) || [],
        selectedOptions:
          userAnswer?.selectedOptions?.map((option) => ({
            id: option.id,
            content: option.content,
          })) || [],
        textAnswer: userAnswer?.textAnswer || null,
      };
    });

    // Step 6: Determine message based on participation
    let message: string | undefined;
    if (answers.length === 0) {
      message = isFailedAttendee
        ? 'You attended this poll but did not submit answers'
        : 'You have not submitted answers for this poll';
    }

    // Step 7: Return poll with questions and optional message
    return {
      poll,
      questions: questionDetails,
      message,
    };
  }
}
