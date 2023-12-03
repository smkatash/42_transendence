import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";
import { JoinedChannel } from "./joinedChannel.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ default: true })
  private: boolean;

  @ManyToOne(() => User, owner => owner.channels, { nullable: true })
  @JoinColumn()
  owner: User;

  @Column({ nullable: true })
  hash: string;

  @Column({ nullable: true })
  topic: string;

  @ManyToMany(() => User, user => user.channels)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, user => user.adminAt, { nullable: true })
  @JoinTable()
  admins: User[];

  @OneToMany(() => Message, message => message.channel, {
    cascade: ["remove"],
  })
  messages: Message[];

  @Column({ default: false, nullable: true })
  protected: boolean;

  @OneToMany(() => JoinedChannel, joinedChannel => joinedChannel.channel)
  joinedUsers: JoinedChannel[];

  @ManyToMany(() => User, user => user.invitedTo)
  @JoinTable()
  invitedUsers: User[];

  @ManyToMany(() => User, user => user.bannedAt, { nullable: true })
  @JoinTable()
  banned: User[];

  @Column({ default: "public", nullable: true })
  type: "private" | "protected" | "public" | "direct";
}
