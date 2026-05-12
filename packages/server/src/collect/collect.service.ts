import { Injectable } from '@nestjs/common';

import { ReportPayloadDto } from './dto/reportPayload.dto';

@Injectable()
export class CollectService {
  report(reportData: ReportPayloadDto) {
    console.log('Received report data:', reportData);
  }
}
