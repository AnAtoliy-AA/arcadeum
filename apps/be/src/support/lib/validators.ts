import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { countUrls } from './sanitize';

export function MaxUrls(max: number, options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'MaxUrls',
      target: target.constructor,
      propertyName,
      constraints: [max],
      options,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return true;
          return countUrls(value) <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains too many URLs (max ${args.constraints[0]})`;
        },
      },
    });
  };
}
