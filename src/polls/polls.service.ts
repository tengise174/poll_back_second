import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { User } from 'src/auth/user.entity';
import { UpdatePollDto } from './dto/update-poll.dto';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
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
}
