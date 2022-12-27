import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Services } from './services.entity';
import { User } from './user.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  refId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Services, (service) => service.appointment, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Services;

  @ManyToOne(() => User, (user) => user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, (user) => user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'doctorId', referencedColumnName: 'id' })
  doctor: User;

  @Column({ default: new Date() })
  created: Date;

  @Column({ default: new Date() })
  modified: Date;
}
