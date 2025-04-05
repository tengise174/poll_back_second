import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { Question } from 'src/questions/question.entity';
import { Answer } from './answers.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from 'src/options/options.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Poll } from 'src/polls/poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question, Option, Poll]), AuthModule],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}

