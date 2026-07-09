import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ip_regions', comment: 'IP区域映射表' })
export class IpRegion {
  @PrimaryColumn({ length: 45, comment: 'IP地址' })
  ip!: string;

  @Column({ length: 32, nullable: true, comment: '国家' })
  country!: string;

  @Column({ length: 32, nullable: true, comment: '省份' })
  province!: string;

  @Column({ length: 32, nullable: true, comment: '城市' })
  city!: string;

  @Column({ length: 64, nullable: true, comment: '运营商' })
  isp!: string;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime!: Date;
}
