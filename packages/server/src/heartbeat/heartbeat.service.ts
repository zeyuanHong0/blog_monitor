import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import * as https from 'https';
import * as http from 'http';
import * as tls from 'tls';
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkHealth() {
    const startTime = Date.now();

    // 同时进行 HTTP 请求检测和 SSL 证书检测
    const [httpResult, sslResult] = await Promise.allSettled([
      this.httpCheck(this.targetUrl),
      this.checkSSLExpiry(this.targetUrl),
    ]);

    const responseTime = Date.now() - startTime;

    const data: Partial<Heartbeat> = {
      targetUrl: this.targetUrl,
      responseTime,
      isUp: false,
      sslExpiry: sslResult.status === 'fulfilled' ? sslResult.value : undefined,
    };

    if (httpResult.status === 'fulfilled') {
      const { statusCode } = httpResult.value;
      data.statusCode = statusCode;
      data.isUp = statusCode >= 200 && statusCode < 400;
    } else {
      data.errorMessage =
        httpResult.reason instanceof Error
          ? httpResult.reason.message
          : String(httpResult.reason);
    }

    await this.heartbeatRepository.save(this.heartbeatRepository.create(data));
  }

  /**
   * HTTP 请求检测
   * 超时时间 10 秒
   */
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

  /**
   * SSL 证书到期时间检测
   * 通过 TLS 连接获取证书信息
   */
  private checkSSLExpiry(url: string): Promise<Date | undefined> {
    return new Promise((resolve) => {
      const hostname = new URL(url).hostname;
      const socket = tls.connect(
        443,
        hostname,
        {
          servername: hostname,
        },
        () => {
          const cert = socket.getPeerCertificate();
          socket.destroy();
          if (cert?.valid_to) {
            resolve(new Date(cert.valid_to));
          } else {
            resolve(undefined);
          }
        },
      );
      socket.setTimeout(5000);
      socket.on('timeout', () => {
        socket.destroy();
        resolve(undefined);
      });
      socket.on('error', () => {
        resolve(undefined);
      });
    });
  }
}
