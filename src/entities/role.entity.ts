import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

enum Roles {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  USER = 'user',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: Roles })
  name: Roles;
}
