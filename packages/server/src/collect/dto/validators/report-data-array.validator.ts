import { plainToInstance } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  validateSync,
} from 'class-validator';

import { ErrorDto } from '@/collect/dto/error.dto';
import { EventDto } from '@/collect/dto/event.dto';
import { PageViewDto } from '@/collect/dto/pageview.dto';
import { PerformanceDto } from '@/collect/dto/performance.dto';
import { SoftNavigationDto } from '@/collect/dto/softNavigation.dto';

type ReportItemDtoCtor = new () => object;

const REPORT_DATA_DTO_MAP: Record<string, ReportItemDtoCtor> = {
  pageview: PageViewDto,
  performance: PerformanceDto,
  soft_navigation: SoftNavigationDto,
  error: ErrorDto,
  event: EventDto,
};

function isValidReportItem(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const type = (item as { type?: unknown }).type;
  if (typeof type !== 'string') {
    return false;
  }

  const ItemDto = REPORT_DATA_DTO_MAP[type];
  if (!ItemDto) {
    return false;
  }

  const instance = plainToInstance(ItemDto, item);
  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  return errors.length === 0;
}

export function IsReportDataArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isReportDataArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return false;
          }

          return value.every((item) => isValidReportItem(item));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 中存在不合法的数据项`;
        },
      },
    });
  };
}
