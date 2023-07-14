import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from './product.entity';

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  link: string;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
