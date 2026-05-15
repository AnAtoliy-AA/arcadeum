import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ALLOW = /^(https?:\/\/|\/)/;
const DENY = /^javascript:/i;

export function IsSafeUrl(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'isSafeUrl',
      target: target.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (typeof value !== 'string') return false;
          if (DENY.test(value)) return false;
          return ALLOW.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an https URL or a root-relative path starting with /`;
        },
      },
    });
  };
}
