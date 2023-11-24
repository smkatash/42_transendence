import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mutedUntil: Date;

  @Column()
  uId: string;

  @Column()
  cId: number;
}
