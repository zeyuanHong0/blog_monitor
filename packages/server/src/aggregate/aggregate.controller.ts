import { Controller } from '@nestjs/common';
import { AggregateService } from './aggregate.service';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly aggregateService: AggregateService) {}
}
