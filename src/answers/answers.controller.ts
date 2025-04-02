import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('answers')
@UseGuards(AuthGuard())
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  async create(
    @Body() createAnswerDtos: CreateAnswerDto[],
    @GetUser() user: User,
  ) {
    return this.answersService.saveAnswers(createAnswerDtos, user);
  }
}
