import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mute{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mutedUntil: Date;

    @Column()
    uId: string;

    @Column()
    cId: number;
}