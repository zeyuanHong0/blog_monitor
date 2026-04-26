import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'events', comment: '用户行为埋点表' })
@Index(['appId', 'eventName'])
@Index(['appId', 'createdTime'])
@Index(['appId', 'sessionId'])
export class MonitorEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appId!: string;

  @Column({ comment: '事件名称' })
  eventName!: string;

  @Column('json', { comment: '事件数据' })
  eventData!: Record<string, any>;

  @Column()
  url!: string;

  @Column()
  sessionId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdTime!: Date;
}
