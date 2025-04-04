import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { User } from 'src/auth/user.entity';
import { UpdatePollDto } from './dto/update-poll.dto';
import { Question } from 'src/questions/question.entity';
import { Answer } from 'src/answers/answers.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private questionService: QuestionsService,
  ) {}

  async createPoll(user: User, createPollDto: CreatePollDto): Promise<Poll> {
    const pollsters = await Promise.all(
      createPollDto.pollsters?.map(async (pollsterDto) => {
        return this.userRepository.findOne({
          where: { username: pollsterDto.username },
        });
      }) || [],
    );

    const poll = this.pollRepository.create({
      title: createPollDto.title,
      owner: user,
      greetingMessage: createPollDto.greetingMessage,
      btnLabel: createPollDto.btnLabel,
      endTitle: createPollDto.endTitle,
      thankYouMessage: createPollDto.thankYouMessage,
      isAccessLevel: createPollDto.isAccessLevel,
      isTimeSelected: createPollDto.isTimeSelected,
      isDuration: createPollDto.isDuration,
      isPollsterNumber: createPollDto.isPollsterNumber,
      themeId: createPollDto.themeId,
      duration: createPollDto.duration,
      pollsterNumber: createPollDto.pollsterNumber,
      startDate: createPollDto.startDate
        ? new Date(createPollDto.startDate)
        : null,
      endDate: createPollDto.endDate ? new Date(createPollDto.endDate) : null,
      pollsters: pollsters.filter(Boolean),
    } as unknown as Partial<Poll>);

    const savedPoll = await this.pollRepository.save(poll);
    createPollDto.questions.map((dto) =>
      this.questionService.createQuestion(savedPoll, dto),
    );
    return savedPoll;
  }

  async updatePoll(pollId: string, user: User, updatePollDto: UpdatePollDto) {
    const poll = await this.getPollById(pollId, user);

    poll.title = updatePollDto.title;
    poll.greetingMessage =
      updatePollDto.greetingMessage ?? poll.greetingMessage;
    poll.btnLabel = updatePollDto.btnLabel ?? poll.btnLabel;
    poll.endTitle = updatePollDto.endTitle ?? poll.endTitle;
    poll.thankYouMessage =
      updatePollDto.thankYouMessage ?? poll.thankYouMessage;
    poll.isAccessLevel = updatePollDto.isAccessLevel ?? poll.isAccessLevel;
    poll.isTimeSelected = updatePollDto.isTimeSelected ?? poll.isTimeSelected;
    poll.isDuration = updatePollDto.isDuration ?? poll.isDuration;
    poll.isPollsterNumber =
      updatePollDto.isPollsterNumber ?? poll.isPollsterNumber;
    poll.themeId = updatePollDto.themeId ?? poll.themeId;
    poll.duration = updatePollDto.duration ?? poll.duration;
    poll.pollsterNumber = updatePollDto.pollsterNumber ?? poll.pollsterNumber;
    poll.startDate = updatePollDto.startDate
      ? new Date(updatePollDto.startDate)
      : poll.startDate;
    poll.endDate = updatePollDto.endDate
      ? new Date(updatePollDto.endDate)
      : poll.endDate;

    if (updatePollDto.pollsters) {
      const pollsters = await Promise.all(
        updatePollDto.pollsters.map(async (pollsterDto) => {
          return this.userRepository.findOne({
            where: { username: pollsterDto.username },
          });
        }),
      );

      poll.pollsters = pollsters.filter(Boolean);
    }

    await this.questionService.deleteQuestionsByPoll(poll);

    const savedPoll = await this.pollRepository.save(poll);
    updatePollDto.questions.map((dto) =>
      this.questionService.createQuestion(savedPoll, dto),
    );

    return await this.getPollById(pollId, user);
  }

  async getAllPoll(user: User) {
    return this.pollRepository.find({
      where: { owner: { id: user.id } },
      relations: ['questions'],
    });
  }

  async getAllPollBasic(user: User) {
    return this.pollRepository.find({
      where: { owner: { id: user.id } },
      select: [
        'id',
        'title',
        'owner',
        'greetingMessage',
        'startDate',
        'endDate',
      ],
    });
  }

  async getPollById(pollId: string, user: User) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions', 'questions.options', 'pollsters'],
    });

    if (!poll && poll.owner.id !== user.id) {
      throw new NotFoundException('this poll not found');
    }

    return poll;
  }

  async getPollForTest(pollId: string, user: User) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: [
        'questions',
        'questions.options',
        'pollsters',
        'questions.answers',
        'questions.answers.user', // Include the user who answered
      ],
    });

    if (!poll) {
      return {
        message: 'Poll not found',
      };
    }

    const currentDate = new Date();

    if (poll.startDate && currentDate < poll.startDate) {
      return {
        message: 'Poll has not started yet',
        startDate: poll.startDate,
      };
    }

    if (poll.endDate && currentDate > poll.endDate) {
      return {
        message: 'Poll has already ended',
        endDate: poll.endDate,
      };
    }

    const userHasAnswered = poll.questions.some((question) =>
      question.answers.some((answer) => answer.user.id === user.id),
    );

    if (userHasAnswered) {
      return {
        message: 'User has already answered',
      };
    }

    return poll;
  }

  async deletePoll(pollId: string, user: User): Promise<void> {
    const poll = await this.pollRepository.findOne({
      where: {
        id: pollId,
        owner: { id: user.id },
      },
    });
  
    if (!poll) {
      throw new NotFoundException(
        'Poll not found or you do not have permission to delete it',
      );
    }
  
    // Delete questions (and their answers) first
    await this.questionService.deleteQuestionsByPoll(poll);
  
    // Delete the poll
    const result = await this.pollRepository.delete({
      id: pollId,
      owner: { id: user.id },
    });
  
    if (result.affected === 0) {
      throw new NotFoundException('Failed to delete poll');
    }
  }

  async getPollStats(pollId: string): Promise<any> {
    // Fetch the poll with its questions
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions'],
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID ${pollId} not found`);
    }

    // Fetch all questions with their options, answers, and related users
    const questions = await this.questionRepository.find({
      where: { poll: { id: pollId } },
      relations: [
        'options',
        'answers',
        'answers.user',
        'answers.selectedOptions',
      ],
    });

    // Build the statistics
    const stats = {
      pollId: poll.id,
      title: poll.title,
      questions: questions.map((question) => {
        const baseQuestionStats = {
          questionId: question.id,
          content: question.content,
          questionType: question.questionType,
        };

        if (question.questionType === 'TEXT') {
          // For TEXT questions, return text answers with user info
          return {
            ...baseQuestionStats,
            answers: question.answers.map((answer) => ({
              textAnswer: answer.textAnswer,
              answeredBy: answer.user.username,
              createdAt: answer.createdAt,
            })),
          };
        } else {
          // For MULTI_CHOICE, SINGLE_CHOICE, RATING, YES_NO (all option-based)
          const optionStats = question.options.map((option) => {
            const selectionCount = question.answers.reduce((count, answer) => {
              const isSelected = answer.selectedOptions.some(
                (selectedOption) => selectedOption.id === option.id,
              );
              return count + (isSelected ? 1 : 0);
            }, 0);

            return {
              optionId: option.id,
              content: option.content,
              selectionCount,
              answeredBy: question.answers
                .filter((answer) =>
                  answer.selectedOptions.some(
                    (selectedOption) => selectedOption.id === option.id,
                  ),
                )
                .map((answer) => answer.user.username),
            };
          });

          return {
            ...baseQuestionStats,
            options: optionStats,
          };
        }
      }),
    };

    return stats;
  }
}
