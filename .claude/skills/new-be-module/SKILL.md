---
name: new-be-module
description: Add a new NestJS module to the backend (apps/be). Use when creating a new domain/feature in the backend.
---

The backend uses NestJS with Mongoose (MongoDB), JWT auth, and Socket.io for real-time.

## Folder structure

```
apps/be/src/<module-name>/
  <name>.module.ts       ← NestJS module, registers all providers and Mongoose schemas
  <name>.controller.ts   ← REST endpoints (use @JwtAuthGuard for protected routes)
  <name>.service.ts      ← Business logic
  <name>.gateway.ts      ← (optional) WebSocket gateway for real-time features
  schemas/
    <name>.schema.ts     ← Mongoose schema + type export
  dtos/
    create-<name>.dto.ts ← DTOs with class-validator decorators
```

## Steps

1. **Schema** (`schemas/<name>.schema.ts`):
   ```ts
   import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
   import { Document } from 'mongoose';

   export type <Name>Document = <Name> & Document;

   @Schema({ timestamps: true })
   export class <Name> { ... }

   export const <Name>Schema = SchemaFactory.createForClass(<Name>);
   ```

2. **DTOs** with `class-validator`:
   ```ts
   import { IsString, IsNotEmpty } from 'class-validator';
   export class Create<Name>Dto { @IsString() @IsNotEmpty() field: string; }
   ```

3. **Service** — inject `@InjectModel(<Name>.name) private model: Model<<Name>Document>`

4. **Controller** — use `@UseGuards(JwtAuthGuard)` for protected routes, `@Controller('<name>')` prefix

5. **Module** — register `MongooseModule.forFeature([{ name: <Name>.name, schema: <Name>Schema }])`, declare controller and service

6. **Register** the new module in `apps/be/src/app.module.ts`

## Key imports

```ts
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, Controller, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
```
