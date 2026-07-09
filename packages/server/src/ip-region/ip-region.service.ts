import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpRegion } from './entities/ip-region.entity';
import IP2Region from 'ip2region';

@Injectable()
export class IpRegionService {
  constructor(
    @InjectPinoLogger(IpRegionService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(IpRegion)
    private ipRegionRepository: Repository<IpRegion>,
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
}
