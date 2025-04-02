import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreatePollDto } from './dto/create-poll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';

@Controller('polls')
@UseGuards(AuthGuard())
export class PollsController {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    private readonly pollService: PollsService,
  ) {}

  @Get()
  getAllPoll(@GetUser() user: User) {
    return this.pollService.getAllPoll(user);
  }

  @Get('/all')
  getAllPollBasic(@GetUser() user: User) {
    return this.pollService.getAllPollBasic(user);
  }

  @Get(':id')
  getPollById(@Param('id') pollId: string, @GetUser() user: User) {
    return this.pollService.getPollById(pollId, user);
  }

  @Post()
  createPoll(
    @GetUser() user: User,
    @Body() createPollDto: CreatePollDto,
  ): Promise<Poll> {
    return this.pollService.createPoll(user, createPollDto);
  }

  @Put(':id')
  updatePoll(
    @Param('id') pollId: string,
    @GetUser() user: User,
    @Body() updatePollDto: CreatePollDto,
  ) {
    return this.pollService.updatePoll(pollId, user, updatePollDto);
  }

  @Delete(':id')
  deletePoll(@Param('id') pollId: string, @GetUser() user: User) {
    return this.pollService.deletePoll(pollId, user);
  }
}
