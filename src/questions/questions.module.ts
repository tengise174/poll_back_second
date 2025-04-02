import { forwardRef, Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from 'src/options/options.entity';
import { Question } from './question.entity';
import { OptionsModule } from 'src/options/options.module';
import { AuthModule } from 'src/auth/auth.module';
import { Poll } from 'src/polls/poll.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Option, Poll]),
    forwardRef(() => OptionsModule),
    AuthModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
