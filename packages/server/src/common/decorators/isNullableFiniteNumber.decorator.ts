import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNullableFiniteNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNullableFiniteNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            value === null ||
            (typeof value === 'number' && Number.isFinite(value))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是数字或 null`;
        },
      },
    });
  };
}
