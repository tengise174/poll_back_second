import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    private questionService: QuestionsService,
  ) {}

  async createPoll(user: User, createPollDto: CreatePollDto): Promise<Poll> {
    const poll = this.pollRepository.create({
      title: createPollDto.title,
      owner: user,
    });
    const savedPoll = await this.pollRepository.save(poll);
    createPollDto.questions.map((dto) =>
      this.questionService.createQuestion(savedPoll, dto),
    );
    return savedPoll;
  }

  async getAllPoll(user: User) {
    return this.pollRepository.find({
      where: { owner: { id: user.id } },
      relations: ['owner'],
    });
  }

  async getPollById(pollId: string, user: User) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions', 'questions.answers'],
    });

    if (!poll && poll.owner.id !== user.id) {
      throw new NotFoundException('this poll not found');
    }

    return poll;
  }
}
