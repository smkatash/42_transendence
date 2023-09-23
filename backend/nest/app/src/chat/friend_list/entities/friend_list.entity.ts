import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('friend_list')
export class FriendList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  friendUserId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}