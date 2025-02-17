import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Poll } from 'src/polls/poll.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @OneToMany(() => Poll, (poll) => poll.owner, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ownedPolls: Poll[];

  @ManyToMany(() => Poll, (poll) => poll.pollsters, {
    cascade: ['insert', 'update'],
  })
  polls: Poll[];
}
