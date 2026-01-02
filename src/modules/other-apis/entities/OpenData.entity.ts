import { Column, Entity, PrimaryColumn } from "typeorm";
import { MainEntity } from "../../../shared/database/Base.entity";

@Entity()
export class OpenData extends MainEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    queryString: string;
}