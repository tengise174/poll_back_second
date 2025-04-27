import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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

  @Get('test/:id')
  getPollForTest(@Param('id') pollId: string, @GetUser() user: User, @Query("enterCode") enterCode: string) {
    const parsedEnterCode = enterCode ? parseInt(enterCode, 10) : undefined;
    return this.pollService.getPollForTest(pollId, user, parsedEnterCode);
  }

  @Get()
  getAllPoll(@GetUser() user: User) {
    return this.pollService.getAllPoll(user);
  }


  @Get('/all')
  getAllPollBasic(@GetUser() user: User) {
    return this.pollService.getAllPollBasic(user);
  }

  @Get('/stats/:id')
  getPollStatsById(@Param('id') pollId: string) {
    return this.pollService.getPollStats(pollId);
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

  @Post('failed-attendance/:id')
  async recordFailedAttendance(
    @Param('id') pollId: string,
    @GetUser() user: User,
  ) {
    await this.pollService.recordFailedAttendance(pollId, user);
  }

  @Put(':id')
  updatePoll(
    @Param('id') pollId: string,
    @GetUser() user: User,
    @Body() updatePollDto: CreatePollDto,
  ) {
    return this.pollService.updatePoll(pollId, user, updatePollDto);
  }

  @Patch('publish/:id')
  togglePublishPoll(@Param('id') pollId: string, @GetUser() user: User) {
    return this.pollService.togglePublishPoll(pollId, user);
  }

  @Delete(':id')
  deletePoll(@Param('id') pollId: string, @GetUser() user: User) {
    return this.pollService.deletePoll(pollId, user);
  }
}
