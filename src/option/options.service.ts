import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from './options.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { Question } from 'src/questions/question.entity';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
  ) {}

  async createOption(
    createOptionDto: CreateOptionDto,
    question: Question,
  ): Promise<Option> {
    const option = this.optionRepository.create(createOptionDto);
    option.question = question;
    return this.optionRepository.save(option);
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
