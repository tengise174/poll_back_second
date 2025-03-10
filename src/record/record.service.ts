import { Injectable } from '@nestjs/common';
import { Record } from './record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from 'src/auth/user.entity';
import { Answer } from 'src/answers/answer.entity';
import { Question } from 'src/questions/question.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async createRecords(user: User, createRecordsDto: CreateRecordDto[]) {
    const records = await Promise.all(
      createRecordsDto.map(async (dto) => {
        const question = await this.questionRepository.findOne({
          where: { id: dto.questionId },
        });

        const answer = await this.answerRepository.findOne({
          where: { id: dto.answerId },
        });

        if (!answer && !question) {
          throw new Error(
            `Question with id ${dto.questionId} or answer with id ${dto.answerId} not found`,
          );
        }

        const record = this.recordRepository.create({
          pollster: user,
          answer: answer,
          question: question,
        });
        return record;
      }),
    );

    return this.recordRepository.save(records);
  }
}
