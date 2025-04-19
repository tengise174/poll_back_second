import { IsBoolean, IsNumber } from 'class-validator';
import { Answer } from 'src/answers/answers.entity';
import { Option } from 'src/options/options.entity';
import { Poll } from 'src/polls/poll.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuestionType {
  MULTI_CHOICE = 'MULTI_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  RATING = 'RATING',
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
  MULTIPLE_CHOICE_GRID = 'MULTIPLE_CHOICE_GRID',
}

enum RateType {
  STAR = 'STAR',
  NUMBER = 'NUMBER',
}

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    nullable: true,
    default: null,
  })
  questionType: QuestionType;

  @Column({ nullable: true })
  minAnswerCount: number;

  @Column({
    type: 'enum',
    enum: RateType,
    nullable: true,
    default: null,
  })
  rateType: RateType;

  @Column({ nullable: true })
  @IsNumber()
  rateNumber: number;

  @Column({ nullable: true })
  @IsNumber()
  order: number;

  @Column({ nullable: true })
  @IsBoolean()
  required: boolean;

  @Column({ nullable: true })
  @IsBoolean()
  isPointBased: boolean;

  @Column({ nullable: true })
  @IsBoolean()
  hasCorrectAnswer: boolean;

  @Column({ type: 'text', nullable: true })
  poster: string | null;

  @Column({ type: 'json', nullable: true, default: '[]' })
  gridRows: string[];

  @Column({ type: 'json', nullable: true, default: '[]' })
  gridColumns: string[];

  @OneToMany(() => Option, (option) => option.question)
  options: Option[];

  @ManyToOne(() => Poll, (poll) => poll.questions)
  poll: Poll;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
