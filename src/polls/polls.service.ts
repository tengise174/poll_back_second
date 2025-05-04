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
      category: createPollDto.category,
      isShowUser: createPollDto.isShowUser,
      isHasEnterCode: createPollDto.isHasEnterCode,
      isAccessLevel: createPollDto.isAccessLevel,
      isTimeSelected: createPollDto.isTimeSelected,
      isDuration: createPollDto.isDuration,
      isPollsterNumber: createPollDto.isPollsterNumber,
      themeId: createPollDto.themeId,
      duration: createPollDto.duration,
      enterCode: createPollDto.enterCode,
      pollsterNumber: createPollDto.pollsterNumber,
      poster: createPollDto.poster,
      startDate: createPollDto.startDate
        ? new Date(createPollDto.startDate)
        : null,
      endDate: createPollDto.endDate ? new Date(createPollDto.endDate) : null,
      pollsters: pollsters.filter(Boolean),
      createdAt: new Date(),
      published: false,
    } as unknown as Partial<Poll>);

    const savedPoll = await this.pollRepository.save(poll);
    createPollDto.questions.map((dto) =>
      this.questionService.createQuestion(savedPoll, dto),
    );
    return savedPoll;
  }

  async updatePoll(pollId: string, user: User, updatePollDto: UpdatePollDto) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId, owner: { id: user.id } },
      relations: ['questions', 'questions.options', 'pollsters'],
    });

    if (!poll) {
      throw new Error('Poll not found or you are not authorized to update it');
    }

    poll.title = updatePollDto.title ?? poll.title;
    poll.greetingMessage =
      updatePollDto.greetingMessage ?? poll.greetingMessage;
    poll.btnLabel = updatePollDto.btnLabel ?? poll.btnLabel;
    poll.endTitle = updatePollDto.endTitle ?? poll.endTitle;
    poll.thankYouMessage =
      updatePollDto.thankYouMessage ?? poll.thankYouMessage;
    poll.category = updatePollDto.category ?? poll.category;
    poll.isShowUser = updatePollDto.isShowUser ?? poll.isShowUser;
    poll.isHasEnterCode = updatePollDto.isHasEnterCode ?? poll.isHasEnterCode;
    poll.isAccessLevel = updatePollDto.isAccessLevel ?? poll.isAccessLevel;
    poll.isTimeSelected = updatePollDto.isTimeSelected ?? poll.isTimeSelected;
    poll.isDuration = updatePollDto.isDuration ?? poll.isDuration;
    poll.isPollsterNumber =
      updatePollDto.isPollsterNumber ?? poll.isPollsterNumber;
    poll.themeId = updatePollDto.themeId ?? poll.themeId;
    poll.duration = updatePollDto.duration ?? poll.duration;
    poll.enterCode = updatePollDto.enterCode ?? poll.enterCode;
    poll.pollsterNumber = updatePollDto.pollsterNumber ?? poll.pollsterNumber;
    poll.poster = updatePollDto.poster ?? poll.poster;
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

    const savedPoll = await this.pollRepository.save(poll);

    // Handle questions
    const questionIdsInRequest = updatePollDto.questions
      .filter((q) => q.id && q.id !== null)
      .map((q) => q.id);
    const questionsToDelete = poll.questions.filter(
      (q) => !questionIdsInRequest.includes(q.id),
    );

    for (const question of questionsToDelete) {
      await this.questionRepository.remove(question);
    }

    for (const questionDto of updatePollDto.questions) {
      if (questionDto.id && questionDto.id !== null) {
        // Update existing question
        await this.questionService.updateQuestion(questionDto.id, questionDto);
      } else {
        // Create new question (id is null or undefined)
        await this.questionService.createQuestion(poll, questionDto);
      }
    }

    return await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions', 'questions.options', 'pollsters', 'owner'],
    });
  }

  async getAllPoll(user: User) {
    return this.pollRepository.find({
      where: { owner: { id: user.id } },
      relations: ['questions'],
    });
  }

  async getPollForTest(pollId: string, user: User, enterCode: number) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: [
        'questions',
        'questions.options',
        'pollsters',
        'questions.answers',
        'questions.answers.user',
        'failedAttendees',
      ],
    });

    if (poll.isHasEnterCode && enterCode === undefined) {
      return {
        message: 'Enter code is required',
      };
    }

    if (poll.isHasEnterCode && poll.enterCode !== enterCode) {
      return {
        message: 'Invalid enter code',
      };
    }

    if (!poll) {
      return {
        message: 'Poll not found',
      };
    }

    if (!poll.published) {
      return {
        message: 'Poll is not published',
      };
    }

    if (poll.isAccessLevel) {
      const isPollster = poll.pollsters.some(
        (pollster) => pollster.id === user.id,
      );
      if (!isPollster) {
        return {
          message: "Don't have access",
        };
      }
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

    const submittedUsers = Array.from(
      new Set(
        poll.questions
          .flatMap((question) => question.answers)
          .map((answer) => answer.user.id),
      ),
    );

    const submittedUserCount = submittedUsers.length;

    if (
      poll.isPollsterNumber &&
      poll.pollsterNumber !== null &&
      submittedUserCount >= poll.pollsterNumber
    ) {
      return {
        message: 'Poll is full',
      };
    }

    const userHasAnswered = poll.questions.some((question) =>
      question.answers.some((answer) => answer.user.id === user.id),
    );

    const userFailedToSubmit = poll.failedAttendees.some(
      (attendee) => attendee.id === user.id,
    );

    if (userHasAnswered) {
      return {
        message: 'User has already answered',
      };
    }

    if (userFailedToSubmit) {
      return {
        message: 'User has already attended',
      };
    }

    return poll;
  }

  async togglePublishPoll(pollId: string, user: User): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId, owner: { id: user.id } },
    });

    if (!poll) {
      throw new NotFoundException(
        'Poll not found or you do not have permission to modify it',
      );
    }

    poll.published = !poll.published;
    return await this.pollRepository.save(poll);
  }

  async getAllPollBasic(user: User) {
    const polls = await this.pollRepository.find({
      where: { owner: { id: user.id } },
      select: [
        'id',
        'title',
        'owner',
        'greetingMessage',
        'category',
        'startDate',
        'endDate',
        'createdAt',
        'poster',
        'published',
        'pollsterNumber',
      ],
      relations: [
        'pollsters',
        'questions',
        'questions.answers',
        'questions.answers.user',
      ],
    });

    return polls.map((poll) => {
      const submittedUsers = Array.from(
        new Set(
          poll.questions
            .flatMap((question) => question.answers)
            .filter((answer) => answer.user)
            .map((answer) => answer.user.id),
        ),
      );
      const submittedUserNumber = submittedUsers.length;

      return {
        id: poll.id,
        title: poll.title,
        owner: poll.owner,
        greetingMessage: poll.greetingMessage,
        category: poll.category,
        startDate: poll.startDate,
        endDate: poll.endDate,
        createdAt: poll.createdAt,
        poster: poll.poster,
        published: poll.published,
        pollsterNumber: poll.pollsterNumber,
        submittedUserNumber,
        pollstersLength: poll.pollsters.length,
        questionLength: poll.questions.length,
      };
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

  async recordFailedAttendance(pollId: string, user: User): Promise<void> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: [
        'failedAttendees',
        'questions',
        'questions.answers',
        'questions.answers.user',
      ],
    });

    if (!poll) {
      throw new NotFoundException(`Poll ${pollId} not found`);
    }

    const userHasAnswered = poll.questions.some((question) =>
      question.answers.some((answer) => answer.user.id === user.id),
    );

    const userAlreadyFailed = poll.failedAttendees.some(
      (attendee) => attendee.id === user.id,
    );

    if (userHasAnswered || userAlreadyFailed) {
      return;
    }

    await this.pollRepository.query(
      `
      INSERT INTO poll_attendees_failed ("pollId", "userId")
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [pollId, user.id],
    );
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

    await this.questionService.deleteQuestionsByPoll(poll);

    const result = await this.pollRepository.delete({
      id: pollId,
      owner: { id: user.id },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Failed to delete poll');
    }
  }

  async getPollStats(pollId: string): Promise<any> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: [
        'questions',
        'pollsters',
        'questions.options',
        'questions.answers',
        'questions.answers.user',
        'failedAttendees',
      ],
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID ${pollId} not found`);
    }

    const questions = await this.questionRepository.find({
      where: { poll: { id: pollId } },
      relations: [
        'options',
        'answers',
        'answers.user',
        'answers.selectedOptions',
      ],
    });

    const submittedUsers = Array.from(
      new Set(questions.flatMap((q) => q.answers).map((a) => a.user.id)),
    );
    const submittedUserCount = submittedUsers.length;
    const currentDate = new Date();
    let status: string;

    if (poll.startDate && currentDate < poll.startDate) {
      status = 'YET_OPEN';
    } else if (poll.endDate && currentDate > poll.endDate) {
      status = 'CLOSED';
    } else if (
      poll.isPollsterNumber &&
      poll.pollsterNumber !== null &&
      submittedUserCount >= poll.pollsterNumber
    ) {
      status = 'FULL';
    } else {
      status = 'OPEN';
    }

    const userTotalTimes = new Map<
      string,
      { id: string; username: string; totalTimeTaken: number }
    >();
    questions
      .flatMap((q) => q.answers)
      .forEach((answer) => {
        const userId = answer.user.id;
        const current = userTotalTimes.get(userId) || {
          id: userId,
          username: answer.user.username,
          totalTimeTaken: 0,
        };
        current.totalTimeTaken += answer.timeTaken || 0;
        userTotalTimes.set(userId, current);
      });

    const totalPollTime = Array.from(userTotalTimes.values()).reduce(
      (sum, user) => sum + user.totalTimeTaken,
      0,
    );
    const avgPollTime =
      submittedUserCount > 0 ? totalPollTime / submittedUserCount : 0;

    const stats = {
      pollId: poll.id,
      title: poll.title,
      category: poll.category,
      createdAt: poll.createdAt,
      isAccessLevel: poll.isAccessLevel,
      isDuration: poll.isDuration,
      duration: poll.duration,
      isPollsterNumber: poll.isPollsterNumber,
      isHasEnterCode: poll.isHasEnterCode,
      isShowUser: poll.isShowUser,
      startDate: poll.startDate,
      endDate: poll.endDate,
      poster: poll.poster,
      published: poll.published,
      pollsters: poll.pollsters.map((pollster) => ({
        id: pollster.id,
        username: pollster.username,
      })),
      status,
      submittedUserCount,
      pollsterNumber: poll.pollsterNumber,
      enterCode: poll.enterCode,
      avgPollTime,
      questions: questions.map((question) => {
        const baseQuestionStats = {
          questionId: question.id,
          content: question.content,
          questionType: question.questionType,
          poster: question.poster,
          order: question.order,
          minAnswerCount: question.minAnswerCount,
          rateType: question.rateType,
          rateNumber: question.rateNumber,
          isPointBased: question.isPointBased,
          hasCorrectAnswer: question.hasCorrectAnswer,
          gridRows: question.gridRows,
          gridColumns: question.gridColumns,
          minLabel: question.minLabel,
          maxLabel: question.maxLabel,
          minValue: question.minValue,
          maxValue: question.maxValue,
        };

        const answerCount = question.answers.length;
        const totalTimeForQuestion = question.answers.reduce(
          (sum, answer) => sum + (answer.timeTaken || 0),
          0,
        );
        const avgTimeTaken =
          answerCount > 0 ? totalTimeForQuestion / answerCount : 0;

        if (
          question.questionType === 'TEXT' ||
          question.questionType === 'DATE' ||
          question.questionType === 'TIME'
        ) {
          return {
            ...baseQuestionStats,
            avgTimeTaken,
            answers: question.answers.map((answer) => ({
              textAnswer: answer.textAnswer,
              answeredBy: poll.isShowUser
                ? answer.user.username
                : answer.user.id,
              createdAt: answer.createdAt,
              timeTaken: answer.timeTaken,
            })),
          };
        } else {
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
              order: option.order,
              poster: option.poster,
              points: option.points,
              isCorrect: option.isCorrect,
              selectionCount,
              rowIndex: option.rowIndex,
              columnIndex: option.columnIndex,
              answeredBy: question.answers
                .filter((answer) =>
                  answer.selectedOptions.some(
                    (selectedOption) => selectedOption.id === option.id,
                  ),
                )
                .map((answer) => ({
                  username: poll.isShowUser
                    ? answer.user.username
                    : answer.user.id,
                  timeTaken: answer.timeTaken,
                })),
            };
          });

          return {
            ...baseQuestionStats,
            avgTimeTaken,
            options: optionStats,
          };
        }
      }),
      submittedUsers: Array.from(userTotalTimes.values()).map((user) => ({
        id: user.id,
        username: poll.isShowUser ? user.username : user.id,
        totalTimeTaken: user.totalTimeTaken,
      })),
      failedAttendees: poll.failedAttendees.map((user) => ({
        id: user.id,
        username: poll.isShowUser ? user.username : undefined,
      })),
    };

    return stats;
  }
}
