import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ListingEntity } from "../../listings/entities/Listing.entity";

@Entity()
export class ScheduledViewing extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    user_id: number;

    @Column({ type: 'int', nullable: true })
    apartment_id: number;

    @Column({ type: 'int', nullable: true })
    building_id: number;

    @Column({ type: 'text', nullable: true })
    listing_key: string;

    @Column({ type: 'text', nullable: true })
    property_building_key: string;

    @Column({ type: 'date', nullable: false })
    scheduled_date: Date;

    @Column({ type: 'text', nullable: false })
    message: string;

    @Column({ default: false, nullable: false })
    canceled: boolean;
}