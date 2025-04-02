import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { QuestionsModule } from 'src/questions/questions.module';
import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import { Answer } from 'src/answers/answers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Poll, User, Question, Answer]),
    AuthModule,
    QuestionsModule,
  ],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
