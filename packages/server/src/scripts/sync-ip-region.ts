import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { IpRegionService } from '@/ip-region/ip-region.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(IpRegionService);

    await service.syncHistoryIpRegion();

    console.log('✅ 同步完成');
  } catch (e) {
    console.error(e);
  } finally {
    await app.close();
  }
}

bootstrap();
