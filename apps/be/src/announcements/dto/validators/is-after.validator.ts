import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfter(
  otherProperty: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'isAfter',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [otherProperty],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (value === undefined || value === null) return true;
          const other = (args.object as Record<string, unknown>)[
            args.constraints[0] as string
          ];
          if (other === undefined || other === null) return true;
          return (
            value instanceof Date &&
            other instanceof Date &&
            value.getTime() > other.getTime()
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be strictly after ${args.constraints[0] as string}`;
        },
      },
    });
  };
}
