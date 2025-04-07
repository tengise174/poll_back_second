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
    questionType: QuestionType; // Use the imported enum
    selectedOptions: { id: string; content: string }[];
    textAnswer: string | null;
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

  async saveAnswers(dtos: CreateAnswerDto[], user: User) {
    const answers: Answer[] = [];

    for (const dto of dtos) {
      if (!dto.questionId || (!dto.optionIds && !dto.textAnswer)) {
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

  async getUserAnsweredPolls(user: User) {
    const answers = await this.answerRepository.find({
      where: { user: { id: user.id } },
      relations: ['question', 'question.poll'],
      select: ['id', 'createdAt'],
    });

    const pollsMap = new Map<string, Poll>();

    answers.forEach((answer) => {
      const poll = answer.question.poll;
      if (poll && !pollsMap.has(poll.id)) {
        pollsMap.set(poll.id, {
          id: poll.id,
          title: poll.title,
          greetingMessage: poll.greetingMessage,
          startDate: poll.startDate,
          endDate: poll.endDate,
        } as Poll);
      }
    });

    return Array.from(pollsMap.values());
  }

  async getPollAnswerDetails(pollId: string, user: User): Promise<PollAnswerDetails> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      select: ['id', 'title', 'greetingMessage', 'startDate', 'endDate', 'themeId'],
    });
    if (!poll) throw new Error(`Poll ${pollId} not found`);
  
    // Fetch answers with their related question and selected options
    const answers = await this.answerRepository.find({
      where: {
        user: { id: user.id },
        question: { poll: { id: pollId } },
      },
      relations: ['question', 'selectedOptions'],
      select: ['id', 'textAnswer', 'createdAt'],
    });
  
    if (answers.length === 0) {
      return {
        poll,
        questions: [],
        message: 'No answers found for this poll',
      };
    }
  
    // Fetch all questions for the poll with their options
    const questions = await this.questionRepository.find({
      where: { poll: { id: pollId } },
      relations: ['options'],
      select: ['id', 'content', 'questionType', 'rateNumber', 'rateType'],
    });
  
    // Map the questions and merge with user's answers
    const questionDetails = questions.map((question) => {
      const userAnswer = answers.find((answer) => answer.question.id === question.id);
  
      return {
        questionId: question.id,
        content: question.content,
        questionType: question.questionType,
        rateNumber: question.rateNumber,
        rateType: question.rateType,
        allOptions: question.options?.map((option) => ({
          id: option.id,
          content: option.content,
        })) || [],
        selectedOptions: userAnswer?.selectedOptions?.map((option) => ({
          id: option.id,
          content: option.content,
        })) || [],
        textAnswer: userAnswer?.textAnswer || null,
      };
    });
  
    return { poll, questions: questionDetails };
  }
  
}
