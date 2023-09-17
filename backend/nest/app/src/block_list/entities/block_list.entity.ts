import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('block_list')
export class BLOCK_LIST {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  blockedUserId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}