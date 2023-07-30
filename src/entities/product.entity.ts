import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ProductReview } from './product_review.entity';
import { ProductImages } from './product_images.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, name: 'short_description' })
  shortDescription: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, default: '0.00' })
  price: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false, default: 0 })
  items: number;

  @OneToMany(() => ProductImages, (images) => images.product)
  images: ProductImages[];

  @OneToMany(() => ProductReview, (review) => review.product, { eager: false })
  reviews: ProductReview[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @DeleteDateColumn()
  deleted: Date;
}
