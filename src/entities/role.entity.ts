import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Roles } from '../enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: Roles, unique: true })
  name: Roles;
}
