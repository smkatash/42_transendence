import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity()
export class User {
    constructor(partial: Partial<User>) {
		Object.assign(this, partial);
	}

    @PrimaryColumn({unique: true})
	id: number;

	@Column({unique: true})
	username: string;
}