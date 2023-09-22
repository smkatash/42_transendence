import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./player.entity";


@Entity({ name: 'queue' })
export class Queue {
  @PrimaryColumn({default: 'fifo'})
  id: string

  @OneToMany(() => Player, (player) => player.queue)
  @JoinColumn()
  player: Player

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinTime: Date
}