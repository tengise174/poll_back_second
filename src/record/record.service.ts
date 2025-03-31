import { Injectable } from '@nestjs/common';
import { Record } from './record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from 'src/auth/user.entity';
import { Option } from 'src/option/options.entity';
import { Question } from 'src/questions/question.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async createRecords(user: User, createRecordsDto: CreateRecordDto[]) {
    const records = await Promise.all(
      createRecordsDto.map(async (dto) => {
        const question = await this.questionRepository.findOne({
          where: { id: dto.questionId },
        });

        const option = await this.optionRepository.findOne({
          where: { id: dto.recordId },
        });

        if (!option && !question) {
          throw new Error(
            `Question with id ${dto.questionId} or option with id ${dto.recordId} not found`,
          );
        }

        const record = this.recordRepository.create({
          pollster: user,
          option: option,
          question: question,
        });
        return record;
      }),
    );

    return this.recordRepository.save(records);
  }
}
