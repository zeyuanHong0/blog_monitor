import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as https from 'https';
import * as http from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Heartbeat } from './entities/heartbeat.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '../enum/config.enum';

@Injectable()
export class HeartbeatService {
  private readonly targetUrl: string;

  constructor(
    @InjectRepository(Heartbeat)
    private heartbeatRepository: Repository<Heartbeat>,
    private readonly configService: ConfigService,
  ) {
    this.targetUrl = this.configService.get<string>(
      ConfigEnum.TARGET_URL,
    ) as string;
  }

  private async httpCheck(url: string): Promise<{ statusCode: number }> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.get(url, (res) => {
        resolve({ statusCode: res.statusCode! });
        res.resume();
      });
      req.setTimeout(10000, () => {
        req.destroy(new Error('Request timeout'));
      });
      req.on('error', reject);
    });
  }

  async checkHealth() {
    const startTime = Date.now();
    try {
      const { statusCode } = await this.httpCheck(this.targetUrl);
      const responseTime = Date.now() - startTime;

      const heartbeat = this.heartbeatRepository.create({
        targetUrl: this.targetUrl,
        statusCode,
        responseTime,
        isUp: statusCode >= 200 && statusCode < 400,
      });
      await this.heartbeatRepository.save(heartbeat);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const heartbeat = this.heartbeatRepository.create({
        targetUrl: this.targetUrl,
        responseTime,
        isUp: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      await this.heartbeatRepository.save(heartbeat);
    }
  }
}
