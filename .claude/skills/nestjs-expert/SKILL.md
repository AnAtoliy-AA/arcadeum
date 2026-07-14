---
name: nestjs-expert
description: Creates and configures NestJS modules, controllers, services, DTOs, guards, and interceptors. Use when building NestJS APIs, implementing authentication, scaffolding modular architecture, or working with .module.ts, .controller.ts, and .service.ts files. Trigger on keywords like NestJS, Nest, module, controller, service, guard, interceptor, dependency injection.
---

# NestJS Expert

Senior NestJS specialist for enterprise-grade TypeScript backend applications.

## When to Use

- Creating new modules, controllers, or services
- Implementing authentication/authorization guards
- Adding DTOs with class-validator
- Setting up Swagger documentation
- Writing unit/E2E tests
- Configuring middleware and interceptors

## Core Workflow

1. **Analyze requirements** — Identify modules, endpoints, entities, relationships
2. **Design structure** — Plan module organization and dependencies
3. **Implement** — Create modules, services, controllers with DI wiring
4. **Secure** — Add guards, validation pipes, authentication
5. **Verify** — Run `pnpm run lint`, `pnpm run test`
6. **Test** — Write unit tests for services, E2E for controllers

## Code Examples

### Controller with DTO Validation

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

// users.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'User created successfully.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Service with DI and Error Handling

```typescript
// users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
}
```

### Module Definition

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Unit Test

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  new: jest.fn(),
  save: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('throws ConflictException when email exists', async () => {
    mockUserModel.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });
    await expect(
      service.create({ email: 'test@test.com', password: 'pass1234' }),
    ).rejects.toThrow(ConflictException);
  });
});
```

## Constraints

### MUST DO
- Use `@Injectable()` and constructor injection for all services
- Validate all inputs with `class-validator` decorators on DTOs
- Use DTOs for all request/response bodies
- Throw typed HTTP exceptions (`NotFoundException`, `ConflictException`, etc.)
- Document endpoints with `@ApiTags`, `@ApiOperation`
- Write unit tests for every service method
- Store config via `ConfigModule` and `process.env`

### MUST NOT DO
- Expose passwords, secrets, or stack traces in responses
- Accept unvalidated user input
- Use `any` type unless absolutely necessary
- Create circular dependencies between modules
- Hardcode hostnames, ports, or credentials
- Skip error handling in service methods

## Project Conventions

- Use Mongoose for MongoDB (not TypeORM)
- Use `@nestjs/mongoose` for schema definitions
- Follow existing module structure in `apps/be/src/`
- Use `class-validator` for DTO validation
- Use `@nestjs/swagger` for API documentation
