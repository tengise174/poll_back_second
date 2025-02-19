import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuestionDto } from './dto/create-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from 'src/polls/poll.entity';
import { Question } from './question.entity';
import { DeleteQuestionsDto } from './dto/delete-questions.dto';

@Controller('questions')
@UseGuards(AuthGuard())
export class QuestionsController {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    private questionService: QuestionsService,
  ) {}

  @Get(':id')
  async getQuestionsOfPoll(@Param('id') pollId: string): Promise<Question[]> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId } });
    return this.questionService.getQuestions(poll);
  }

  @Post(':id')
  async createQuestion(
    @Param('id') pollId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    console.log(pollId);
    const poll = await this.pollRepository.findOne({ where: { id: pollId } });
    return this.questionService.createQuestion(poll, createQuestionDto);
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') questionId: string) {
    this.questionService.deleteQuestion(questionId);
  }

  @Delete()
  async deleteQuestions(@Body() deleteQuestionsDto: DeleteQuestionsDto) {
    return this.questionService.deleteQuestions(deleteQuestionsDto);
  }
}
