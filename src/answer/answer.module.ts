import { Module } from '@nestjs/common';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from 'src/polls/poll.entity';
import { Question } from 'src/questions/question.entity';
import { Answer } from './answer.entity';
import { Option } from 'src/option/options.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question, Option, Poll]), AuthModule],
  controllers: [AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
