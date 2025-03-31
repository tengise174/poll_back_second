import { Exclude } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Question } from 'src/questions/question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  @IsNumber()
  order: number;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  question: Question;
}
