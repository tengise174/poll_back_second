import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { Option } from 'src/option/options.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Question } from 'src/questions/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record, Option, Question]), AuthModule],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
