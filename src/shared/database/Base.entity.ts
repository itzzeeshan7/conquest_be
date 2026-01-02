import { Exclude } from 'class-transformer';
import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class MainEntity extends BaseEntity {
  @Exclude()
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'date_created',
  })
  createdAt: Date;
  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'date_updated',
  })
  updatedAt: Date;
}
