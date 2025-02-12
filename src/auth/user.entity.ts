import { Task } from '../tasks/task.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Poll } from 'src/polls/poll.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Task, (task) => task.user, { eager: true })
  tasks: Task[];

  @OneToMany(() => Poll, (poll) => poll.owner, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  ownedPolls: Poll[];

  @ManyToMany(() => Poll, (poll) => poll.pollsters)
  polls: Poll[];
}
