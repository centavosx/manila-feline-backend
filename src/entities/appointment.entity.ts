import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Services } from './services.entity';
import { Exclude } from 'class-transformer';
import { UserPayment } from './user_payment.entity';

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

export enum Gender {
  male = 'MALE',
  female = 'FEMALE',
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
  petName: string | null;

  @Column({ nullable: true })
  birthDate: string | null;

  @Column({ nullable: true })
  age: number | null;

  @Column({ nullable: true })
  gender: Gender | null;

  @Column({ nullable: true })
  date: Date;

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

  @Exclude()
  @OneToOne(() => UserPayment, (payment) => payment.appointment)
  payment: UserPayment | null;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
