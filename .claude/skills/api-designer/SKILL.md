---
name: api-designer
description: Design RESTful APIs with proper endpoints, status codes, and documentation. Use when designing new APIs, refactoring endpoints, or adding Swagger documentation. Trigger on keywords like API design, REST, endpoint, Swagger, OpenAPI, HTTP methods.
---

# API Designer

## When to Use

- Designing new APIs
- Refactoring endpoints
- Adding Swagger documentation
- Defining API contracts
- Implementing versioning

## RESTful API Design

### HTTP Methods
| Method | Use | Idempotent | Safe |
|--------|-----|------------|------|
| GET | Read resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

### Status Codes
| Code | Meaning | Use When |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

### URL Patterns
```
GET    /api/games           # List games
POST   /api/games           # Create game
GET    /api/games/:id       # Get game
PUT    /api/games/:id       # Update game
DELETE /api/games/:id       # Delete game

GET    /api/games/:id/moves # List moves for game
POST   /api/games/:id/moves # Create move in game
```

## NestJS Implementation

### Controller

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('games')
@Controller('api/games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'List games' })
  async findAll(@Query() query: ListGamesDto) {
    return this.gamesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create game' })
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game' })
  async findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update game' })
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete game' })
  async remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
```

### DTOs

```typescript
// create-game.dto.ts
import { IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ example: 'Chess' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'chess', enum: ['chess', 'checkers', 'go'] })
  @IsEnum(['chess', 'checkers', 'go'])
  type: string;

  @ApiProperty({ example: 2, minimum: 2, maximum: 8 })
  @IsNumber()
  @Min(2)
  @Max(8)
  maxPlayers: number;
}

// list-games.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListGamesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'all'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
```

### Pagination Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## API Documentation (Swagger)

### Main Config
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Arcadeum API')
  .setDescription('Gaming platform API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

## Constraints

### MUST DO
- Use proper HTTP methods
- Return appropriate status codes
- Validate all inputs with DTOs
- Document with Swagger decorators
- Use consistent response formats
- Handle errors gracefully

### MUST NOT DO
- Use GET for mutations
- Return 200 for errors
- Expose internal errors to clients
- Skip input validation
- Use inconsistent naming
- Ignore rate limiting
