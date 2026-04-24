import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '@/enum/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: Role.TOURIST })
  accountType: Role;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;
}
