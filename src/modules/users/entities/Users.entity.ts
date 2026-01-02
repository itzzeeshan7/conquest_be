import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MainEntity } from '../../../shared/database/Base.entity';
import { UserRole } from './UserRole.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class Users extends MainEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Exclude()
  @Column({nullable: false, default: 0})
  invalidLogin: number;

  @Exclude()
  @Column({nullable: true, type: 'timestamp'})
  invalidLoginTimestamp: Date;

  @Exclude()
  @Column({
    default: false,
    type: 'boolean',
  })
  emailActivated: boolean;

  @Exclude()
  @Column({
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastActivity: Date;

  @Column({
    nullable: true,
  })
  photo: string;

  @Column({ nullable: false, default: true })
  receiveNotification: boolean;

  @ManyToMany(() => UserRole, (role) => role.id, {
    eager: true
  })
  @JoinTable({ name: 'users_roles' })
  roles: UserRole[];

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
