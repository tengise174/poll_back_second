import { Body, Controller, Param, Post } from '@nestjs/common';
import { OptionsService } from './options.service';
import { QuestionsService } from 'src/questions/questions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from 'src/questions/question.entity';
import { CreateOptionDto } from './dto/create-option.dto';

@Controller('options')
export class OptionsController {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private optionsService: OptionsService,
    private questionService: QuestionsService,
  ) {}

  @Post(':id')
  async createOption(
    @Param('id') questionId: string,
    @Body() createOptionsDto: CreateOptionDto[],
  ) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    this.optionsService.createOptions(createOptionsDto, question);
  }
}
