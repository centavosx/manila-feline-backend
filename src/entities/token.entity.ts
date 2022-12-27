import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tokenId: string;

  @Column()
  exp: Date;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: new Date() })
  created: Date;
}
