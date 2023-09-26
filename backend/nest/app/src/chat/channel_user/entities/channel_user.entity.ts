import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('channel_user')
export class CHANNEL_USER {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  channel_id: number;

  @Column()
  permission: number;//admin owner

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}