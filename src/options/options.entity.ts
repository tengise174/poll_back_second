import { Exclude } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';
import { Answer } from 'src/answers/answers.entity';
import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  @IsNumber()
  order: number;

  @Column({ type: 'text', nullable: true })
  poster: string | null;

  @Column({nullable: true})
  @IsNumber()
  points: number;

  @Column({nullable: true})
  @IsBoolean()
  isCorrect: boolean;

  @Column({nullable: true})
  @IsNumber()
  nextQuestionOrder: number | null;

  @Column({ nullable: true })
  @IsNumber()
  rowIndex: number | null;

  @Column({ nullable: true })
  @IsNumber()
  columnIndex: number | null;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  question: Question;

  @ManyToMany(() => Answer, (answer) => answer.selectedOptions, {
    eager: false,
    onDelete: 'CASCADE',
  })
  answers: Answer[];
}
