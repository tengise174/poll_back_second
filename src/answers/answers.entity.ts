import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import { Option } from 'src/options/options.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.answers, { eager: false })
  user: User;

  @ManyToOne(() => Question, (question) => question.answers, { eager: false })
  question: Question;

  @ManyToMany(() => Option, { nullable: true })
  selectedOptions: Option[];

  @Column({ nullable: true })
  textAnswer: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
