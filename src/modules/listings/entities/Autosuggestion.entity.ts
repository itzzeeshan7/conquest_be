import { MainEntity } from '../../../shared/database/Base.entity';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum AutosuggestionType {
    PLACE = 1,
    ADDRESS = 2,
    BUILDING_NAME = 3,
    FULL_ADDRESS = 4,
    ZIP = 5,
    CITY = 6,
    REGION = 7
}

@Entity({ synchronize: false })
@Unique('UNIQUE_NAME_TYPE', ['name', 'type'])
@Unique('UNIQUE_NAME_TYPE_BUILDING_KEY', ['name', 'building_key', 'type'])
export class Autosuggestion extends MainEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'text', nullable: false})
    name: string;

    @Column({
        type: "enum",
        enum: AutosuggestionType,
        default: AutosuggestionType.ADDRESS
    })
    type: AutosuggestionType

    @Column({type: 'tsvector', select: false})
    name_vector: string;

    @Column({type: 'text', nullable: true})
    building_key: string;

    @Column({type: 'text', unique: true, nullable: true})
    listing_key: string;

    @Column ({type: 'text', nullable: true})
    status: string;

    @Column ({type: 'text', nullable: true})
    salesOrRental: string;

    @Column ({type: 'text', nullable: true})
    full_name: string;
}

// CREATE OR REPLACE FUNCTION update_name_vector()
// RETURNS TRIGGER AS $$
// BEGIN
//     NEW.name_vector := to_tsvector(NEW.name);
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// CREATE TRIGGER tsvector_update_trigger
// BEFORE INSERT OR UPDATE ON autosuggestion
// FOR EACH ROW EXECUTE FUNCTION update_name_vector();

// CREATE INDEX autosuggestion_name_vector_idx
// ON autosuggestion USING gin(name_vector);

// -- Requires superuser privileges
// CREATE EXTENSION IF NOT EXISTS pg_trgm;

// -- Verify installation
// SELECT * FROM pg_extension WHERE extname = 'pg_trgm';

// CREATE INDEX autosuggestion_name_trgm_idx
// ON autosuggestion USING gin (name gin_trgm_ops);