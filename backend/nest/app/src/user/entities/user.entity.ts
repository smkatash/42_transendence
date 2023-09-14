import { Column, Entity, PrimaryColumn} from "typeorm";
import { Status } from "../utils/status.dto";
import { Socket } from "socket.io";


@Entity({name: 'users'})
export class User {
    @PrimaryColumn({unique: true})
    id: string
    
    @Column({unique: true})
    username: string
    
    @Column()
    email: string
    
    @Column()
    avatar: string

    @Column({ default: Status.OFFLINE})
    status: Status
}