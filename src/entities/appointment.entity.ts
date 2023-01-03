import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Services } from './services.entity';
import { User } from './user.entity';

export enum Status {
  pending = 'Pending',
  accepted = 'Accepted',
  completed = 'Completed',
  cancelled = 'Cancelled',
}

export enum AmOrPm {
  AM = 'AM',
  PM = 'PM',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  refId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: Status.pending })
  status: Status;

  @Column()
  time: AmOrPm;

  @Column({ nullable: true })
  verification: string;

  @ManyToOne(() => Services, (service) => service.appointment, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'serviceId', referencedColumnName: 'id' })
  service: Services;

  @ApiProperty({ type: User })
  @ManyToOne(() => User, (user) => user.appointment, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
