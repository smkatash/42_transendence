import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Channel } from "./channel.entity";

@Unique(["user", "channel"])
@Entity()
export class JoinedChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @ManyToOne(() => User, user => user.joinedChannels, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Channel, channel => channel.joinedUsers, { onDelete: "CASCADE" })
  @JoinColumn()
  channel: Channel;
}
