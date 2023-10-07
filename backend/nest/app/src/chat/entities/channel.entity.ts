import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channel    {
    @PrimaryGeneratedColumn()
    chatId: number;

    @Column({unique: true})
    name: string;

    @Column()
    private: boolean;

    @Column()
    owner: number;

    @Column()
    hash: string;

    @Column()
    topic: string;

    // @Column()

}