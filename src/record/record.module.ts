import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { Answer } from 'src/answers/answer.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Question } from 'src/questions/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record, Answer, Question]), AuthModule],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
