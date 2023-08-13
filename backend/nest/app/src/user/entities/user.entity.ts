import { BeforeInsert, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: 'users'})
export class User {
    @PrimaryColumn({unique: true})
    id: string
    
    @Column()
    username: string
    
    @Column()
    email: string
    
    @Column()
    avatar: string

    @Column()
    status: boolean
}