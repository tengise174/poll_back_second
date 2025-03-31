import { Exclude } from 'class-transformer';
import { Question } from 'src/questions/question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  order: number;

  @Column()
  content: string;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  question: Question;
}
