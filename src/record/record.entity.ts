import { Exclude } from 'class-transformer';
import { Answer } from 'src/answers/answer.entity';
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

  @ManyToOne(() => Answer, (answer) => answer.id, { eager: false })
  @Exclude({ toPlainOnly: true })
  answer: Answer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
