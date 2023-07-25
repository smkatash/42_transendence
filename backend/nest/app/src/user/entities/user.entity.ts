import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: 'users'})
export class User {
    @PrimaryColumn()
    id: string
    
    @Column()
    login: string
    
    @Column()
    email: string
    
    @Column()
    avatar: string
}