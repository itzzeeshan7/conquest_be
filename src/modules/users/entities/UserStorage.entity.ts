import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Unique,
  Index,
} from 'typeorm';

import { MainEntity } from '../../../shared/database/Base.entity';
import { ListingEntity } from '../../listings/entities/Listing.entity';
import { Users } from './Users.entity';
import { PropertyEntity } from '../../listings/entities/Property.entity';

@Entity()
@Unique('user_apartament_building', ['listing_key', 'user', 'building_key'])
export class UserStorage extends MainEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('USER_INDEX')
  @ManyToOne(() => Users, (user: Users) => user.id, {
    eager: true,
  })
  @JoinColumn()
  user: Users;

  // @OneToOne(() => ListingEntity, (apartament: ListingEntity) => apartament.id, {
  //   eager: true,
  //   nullable: true,
  // })
  // @JoinColumn()
  // apartament: ListingEntity;

  // @OneToOne(
  //   () => ListingEntity,
  //   (building: ListingEntity) => building.building_id,
  //   {
  //     eager: true,
  //     nullable: true,
  //   }
  // )
  // @JoinColumn()
  // building: ListingEntity;

  @Column({type: 'text', nullable: true})
  listing_key: string;

  @Column({ type: 'int', nullable: true })
  building_index: number;

  @Column({ type: 'text', nullable: true })
  building_key: string;

  @Column({ nullable: true, default: false })
  sendNotification: boolean;

  @Column({ nullable: true })
  listingUpdatedDate: Date;

  @Column({ nullable: true })
  notificationSentDate: Date;
}
