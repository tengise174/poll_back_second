import { Injectable } from '@nestjs/common';
import { Record } from './record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from 'src/auth/user.entity';
import { Answer } from 'src/answers/answer.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async createRecords(user: User, createRecordsDto: CreateRecordDto[]) {
    const records = await Promise.all(
      createRecordsDto.map(async (dto) => {
        const answer = await this.answerRepository.findOne({
          where: { id: dto.id },
          relations: ['question'],
        });

        if (!answer) {
          throw new Error(`Answer with id ${dto.id} not found`);
        }

        const record = this.recordRepository.create({
          pollster: user,
          answer: answer,
        });
        return record;
      }),
    );

    return this.recordRepository.save(records);
  }
}
