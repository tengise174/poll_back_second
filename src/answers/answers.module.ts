import { forwardRef, Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './answer.entity';
import { QuestionsModule } from 'src/questions/questions.module';
import { Question } from 'src/questions/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, Question]),
    forwardRef(() => QuestionsModule),
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
