import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService, PollAnswerDetails } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('answers')
@UseGuards(AuthGuard())
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('my-polls')
  async getAnsweredPolls(@GetUser() user: User) {
    return this.answersService.getUserAnsweredPolls(user);
  }

  @Get('/poll/:id')
  async getAnswerDetails(
    @Param('id') pollId: string,
    @GetUser() user: User,
  ): Promise<PollAnswerDetails> {
    return this.answersService.getPollAnswerDetails(pollId, user);
  }

  @Post()
  async create(
    @Body() createAnswerDtos: CreateAnswerDto[],
    @GetUser() user: User,
  ) {
    return this.answersService.saveAnswers(createAnswerDtos, user);
  }
}
