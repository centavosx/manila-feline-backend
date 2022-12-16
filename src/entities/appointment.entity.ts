import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  refId: string;

  @Column()
  userId: string;

  @Column()
  doctorId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'doctorId', referencedColumnName: 'id' })
  doctor: User;

  @Column({ default: new Date() })
  created: Date;

  @Column({ default: new Date() })
  modified: Date;
}
