import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  greetingMessage: string;

  @Column()
  btnLabel: string;

  @Column()
  endTitle: string;

  @Column()
  thankYouMessage: string;

  @ManyToOne(() => User, (user) => user.ownedPolls, { eager: false })
  @Exclude({ toPlainOnly: true })
  owner: User;

  @ManyToMany(() => User, (user) => user.polls, {
    cascade: ['insert', 'update'],
  })
  pollsters: User[];

  @OneToMany(() => Question, (question) => question.poll)
  questions: Question[];

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  duration: number;

  @Column()
  pollsterNumber: number;


}

// Window commit
