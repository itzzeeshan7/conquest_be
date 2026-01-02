import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MainEntity } from "../../../shared/database/Base.entity";

@Entity()
export class UserRole extends MainEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    name: string;
}
