import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('answer')
@UseGuards(AuthGuard())
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post()
  async createAnswer(
    @GetUser() user: User,
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return this.answerService.createAnswer(user, createAnswerDto);
  }

  @Get('/completed/:pollId')
  async hasCompletedPoll(
    @GetUser() user: User,
    @Param('pollId') pollId: string,
  ) {
    const completed = await this.answerService.hasCompletedPoll(user, pollId);
    return { completed };
  }
}
