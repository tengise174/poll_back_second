import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Poll } from 'src/polls/poll.entity';
import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';

export enum UserType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

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

  @Column()
  @IsOptional()
  firstname: string;

  @Column()
  @IsOptional()
  lastname: string;

  @Column()
  @IsOptional()
  companyname: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.PERSON,
  })
  usertype: UserType;

  @OneToMany(() => User, (user) => user.employer, { nullable: true })
  employees: User[];

  @ManyToOne(() => User, (user) => user.employees, { nullable: true })
  employer?: User;
}
