import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MainEntity } from "../../database/Base.entity";

@Entity()
export class Emails extends MainEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    message: string;

    @Column({ nullable: true })
    emailFrom: string;

    @Column({ nullable: true })
    emailTo: string;
}