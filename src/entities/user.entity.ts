import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Role } from './role.entity';
import { Services } from './services.entity';
import { UserTransaction } from './user_transaction.entity';
import { UserPayment } from './user_payment.entity';
import { ProductReview } from './product_review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  position: string;

  @Column({ default: true })
  verified?: boolean;

  @Exclude()
  @Column({ nullable: true, default: null })
  code?: string;

  @ManyToMany(() => Role, (role) => role.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'roleId' },
  })
  roles: Role[];

  @ManyToMany(() => Services, (service) => service.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_service',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'serviceId' },
  })
  services: Services[];

  @Exclude()
  @OneToMany(() => UserTransaction, (transaction) => transaction.user)
  transactions: UserTransaction[];

  @Exclude()
  @OneToMany(() => UserPayment, (payments) => payments.user)
  payments: UserPayment[];

  @Exclude()
  @OneToMany(() => ProductReview, (review) => review.user)
  userReviews: ProductReview[];

  public hasAm?: boolean;
  public hasPm?: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
