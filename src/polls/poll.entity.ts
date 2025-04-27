import { Exclude, Transform } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import {
  Column,
  Entity,
  JoinTable,
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

  @Column({ nullable: true })
  greetingMessage: string;

  @Column({ nullable: true })
  btnLabel: string;

  @Column({ nullable: true })
  endTitle: string;

  @Column({ nullable: true })
  thankYouMessage: string;

  @Column({ nullable: true })
  themeId: number;

  @ManyToOne(() => User, (user) => user.ownedPolls, { eager: false })
  @Exclude({ toPlainOnly: true })
  owner: User;

  @ManyToMany(() => User, (user) => user.polls, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  @Transform(({ value }) =>
    value.map((user: User) => ({ username: user.username })),
  )
  pollsters: User[];

  @OneToMany(() => Question, (question) => question.poll)
  questions: Question[];

  @Column({ nullable: true })
  isShowUser: boolean;

  @Column({ nullable: true })
  isHasEnterCode: boolean;

  @Column({ nullable: true })
  isAccessLevel: boolean;

  @Column({ nullable: true })
  isTimeSelected: boolean;

  @Column({ nullable: true })
  isDuration: boolean;

  @Column({ nullable: true })
  isPollsterNumber: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  enterCode: number;

  @Column({ nullable: true })
  pollsterNumber: number;

  @ManyToMany(() => User, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'poll_attendees_failed',
    joinColumn: { name: 'pollId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  @Transform(({ value }) =>
    value.map((user: User) => ({ username: user.username })),
  )
  failedAttendees: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  poster: string | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;
}
