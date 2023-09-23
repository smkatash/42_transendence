import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('channel')
export class CHANNEL {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}