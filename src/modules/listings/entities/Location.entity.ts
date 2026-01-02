import { MainEntity } from '../../../shared/database/Base.entity';
import { Column, Entity, PrimaryGeneratedColumn, Index, Unique } from 'typeorm';

@Entity()
@Unique('UNIQUE_LONGITUDE_LATITUDE', ['longitude', 'latitude'])
export class LocationEntity extends MainEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index('LOCATION_ADDRESS_INDEX')
    @Column({type: 'text', nullable: false})
    address: string;

    @Column({ nullable: false })
    longitude: string;

    @Column({ nullable: false })
    latitude: string;

    @Column({ nullable: true })
    postal_code: string;
}