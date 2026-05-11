import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectService {
  report(reportData: any) {
    console.log('Received report data:', reportData);
  }
}
