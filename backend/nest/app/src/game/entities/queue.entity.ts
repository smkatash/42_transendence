import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Player } from "./player.entity";

@Entity('queue')
export class Queue {
  @PrimaryColumn({default: 'fifo'})
  id: string

  @Column({default: 0})
  count: number

  @OneToMany(() => Player, (player) => player.queue)
  players: Player[]
}