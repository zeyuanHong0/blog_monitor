import { Module } from '@nestjs/common';
import { IpRegionService } from './ip-region.service';
import { DevIpRegionController } from './ip-region.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpRegion } from './entities/ip-region.entity';

@Module({
  controllers: [DevIpRegionController],
  imports: [TypeOrmModule.forFeature([IpRegion])],
  providers: [IpRegionService],
  exports: [IpRegionService],
})
export class IpRegionModule {}
