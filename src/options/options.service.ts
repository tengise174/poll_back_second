import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from './options.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { Question } from 'src/questions/question.entity';
import { OptionDto } from './dto/option.dto';
@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
  ) {}

  async createOption(
    optionDto: OptionDto,
    question: Question,
  ): Promise<Option> {
    if (!question.id) {
      throw new Error('Question must have a valid ID');
    }
    const option = this.optionRepository.create({
      content: optionDto.content,
      order: optionDto.order,
      poster: optionDto.poster,
      points: optionDto.points,
      isCorrect: optionDto.isCorrect,
      nextQuestionOrder: optionDto.nextQuestionOrder,
      rowIndex: optionDto.rowIndex,
      columnIndex: optionDto.columnIndex,
      question,
    });
    return this.optionRepository.save(option);
  }

  async updateOption(
    optionId: string,
    optionDto: OptionDto,
  ): Promise<Option> {
    const option = await this.optionRepository.findOne({
      where: { id: optionId },
    });

    if (!option) {
      throw new Error(`Option with ID ${optionId} not found`);
    }

    option.content = optionDto.content ?? option.content;
    option.order = optionDto.order ?? option.order;
    option.poster = optionDto.poster ?? option.poster;
    option.points = optionDto.points ?? option.points;
    option.isCorrect = optionDto.isCorrect ?? option.isCorrect;
    option.nextQuestionOrder = optionDto.nextQuestionOrder ?? option.nextQuestionOrder;
    option.rowIndex = optionDto.rowIndex ?? option.rowIndex;
    option.columnIndex = optionDto.columnIndex ?? option.columnIndex;

    return this.optionRepository.save(option);
  }

  async deleteOption(optionId: string): Promise<void> {
    const option = await this.optionRepository.findOne({
      where: { id: optionId },
    });

    if (!option) {
      throw new Error(`Option with ID ${optionId} not found`);
    }

    await this.optionRepository.remove(option);
  }

  async createOptions(createOptionDto: CreateOptionDto[], question: Question) {
    const options = createOptionDto.map((dto) => {
      const option = this.optionRepository.create(dto);
      option.question = question;
      return option;
    });
    return this.optionRepository.save(options);
  }

  async getOptions(question: Question) {
    return this.optionRepository.find({ where: question });
  }
}
