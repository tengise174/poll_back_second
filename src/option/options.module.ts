import { forwardRef, Module } from '@nestjs/common';
import { OptionsController } from './options.controller';
import { OptionsService } from './options.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from './options.entity';
import { QuestionsModule } from 'src/questions/questions.module';
import { Question } from 'src/questions/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Option, Question]),
    forwardRef(() => QuestionsModule),
  ],
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {}
