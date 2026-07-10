import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import IP2Region from 'ip2region';
import { IpRegion } from './entities/ip-region.entity';
import { PageView } from '@/collect/entities/page-view.entity';

@Injectable()
export class IpRegionService {
  constructor(
    @InjectPinoLogger(IpRegionService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(IpRegion)
    private ipRegionRepository: Repository<IpRegion>,
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
  ) {}
  private query: InstanceType<typeof IP2Region> = new IP2Region({
    disableIpv6: true,
  });

  private isPrivateIp(ip: string): boolean {
    return (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
    );
  }

  async search(ip: string): Promise<void> {
    if (!ip || this.isPrivateIp(ip)) return;
    const cache = await this.ipRegionRepository.findOneBy({ ip });
    if (cache) {
      // 更新一下时间
      await this.ipRegionRepository.update({ ip }, {});
      return;
    }
    try {
      const res = this.query.search(ip);
      if (!res) return;
      await this.ipRegionRepository.save({
        ip,
        country: res.country,
        province: res.province,
        city: res.city,
        isp: res.isp,
      });
      return;
    } catch (err) {
      this.logger.warn(
        `解析 IP ${ip} 失败`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async syncHistoryIpRegion() {
    this.logger.info('开始同步历史 IP 地区数据...');

    const ips = await this.pageViewRepository
      .createQueryBuilder('pv')
      .leftJoin(IpRegion, 'ir', 'pv.ip = ir.ip')
      .where('ir.ip IS NULL')
      .select('DISTINCT pv.ip', 'ip')
      .getRawMany<{ ip: string }>();

    this.logger.info(`共发现 ${ips.length} 个待同步 IP`);

    let success = 0;
    let failed = 0;
    for (const { ip } of ips) {
      try {
        await this.search(ip);
        success++;
      } catch (error) {
        failed++;
        this.logger.error(`同步 IP ${ip} 失败`, error);
      }
    }
    this.logger.info(`历史 IP 地区同步完成，成功：${success}，失败：${failed}`);
  }
}
