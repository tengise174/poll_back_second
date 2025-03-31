import { Exclude } from 'class-transformer';
import { Option } from 'src/option/options.entity';
import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @Exclude({ toPlainOnly: true })
  pollster: User;

  @ManyToOne(() => Question, (question) => question.id, { eager: false })
  @Exclude({ toPlainOnly: true })
  question: Question;

  @ManyToOne(() => Option, (option) => option.id, { eager: false })
  @Exclude({ toPlainOnly: true })
  option: Option;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
