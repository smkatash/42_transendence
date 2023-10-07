import { Column, Entity, PrimaryColumn} from "typeorm";


@Entity({name: 'tokens'})
export class AuthToken {
    @PrimaryColumn({unique: true})
    value: string
    
    @Column()
    userId: string

	@Column({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000' })
	expires: number
}
