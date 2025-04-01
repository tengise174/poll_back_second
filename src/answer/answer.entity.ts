import { User } from 'src/auth/user.entity';
import { Poll } from 'src/polls/poll.entity';
import { Question } from 'src/questions/question.entity';
import { Option } from 'src/option/options.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.answers, { eager: false })
  user: User;

  @ManyToOne(() => Poll, (poll) => poll.answers, { eager: false })
  poll: Poll;

  @ManyToOne(() => Question, (question) => question.answers, { eager: false })
  question: Question;

  @ManyToMany(() => Option, { nullable: true })
  @JoinTable()
  options: Option[];

  @Column({ nullable: true })
  textAnswer: string;

  @CreateDateColumn()
  createdAt: Date;
}
