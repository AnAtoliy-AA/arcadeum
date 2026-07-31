---
name: microservices-architect
description: Design and implement microservice architectures with proper service boundaries, communication patterns, and deployment strategies. Use when designing service boundaries, implementing inter-service communication, or setting up service discovery. Trigger on keywords like microservices, architecture, service boundary, inter-service, service discovery.
---

# Microservices Architect

## When to Use

- Designing service boundaries
- Implementing inter-service communication
- Setting up service discovery
- Implementing event-driven architecture
- Designing distributed systems

## Service Design Principles

### Single Responsibility
- Each service owns one domain
- Services can be developed independently
- Services can be deployed independently

### Boundaries
```
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
└─────────────────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼───┐          ┌───▼───┐          ┌───▼───┐
│ Games │          │ Users │          │ Chat  │
│Service│          │Service│          │Service│
└───┬───┘          └───┬───┘          └───┬───┘
    │                   │                   │
┌───▼───┐          ┌───▼───┐          ┌───▼───┐
│MongoDB│          │MongoDB│          │Redis  │
└───────┘          └───────┘          └───────┘
```

## Communication Patterns

### Synchronous (HTTP/gRPC)
```typescript
// Service calling another service
@Injectable()
export class GamesService {
  constructor(private readonly httpService: HttpService) {}

  async getUser(userId: string): Promise<User> {
    const response = await this.httpService
      .get(`http://users-service/api/users/${userId}`)
      .toPromise();
    return response.data;
  }
}
```

### Asynchronous (Events)
```typescript
// Publishing events
@Injectable()
export class GamesService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createGame(dto: CreateGameDto): Promise<Game> {
    const game = await this.gameModel.create(dto);
    this.eventEmitter.emit('game.created', { gameId: game.id, userId: game.ownerId });
    return game;
  }
}

// Consuming events
@Injectable()
export class NotificationsService {
  constructor(private readonly eventEmitter: EventEmitter2) {
    this.eventEmitter.on('game.created', this.handleGameCreated.bind(this));
  }

  async handleGameCreated(event: { gameId: string; userId: string }) {
    await this.notifyUser(event.userId, `Game ${event.gameId} created`);
  }
}
```

## NestJS Microservices Transport

### TCP Transport
```typescript
// main.ts
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.TCP,
  options: {
    host: '127.0.0.1',
    port: 3001,
  },
});
await app.listen();
```

### Redis Transport
```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

### Message Pattern
```typescript
// Controller
@MessagePattern({ cmd: 'get_game' })
async getGame(@Payload() data: { id: string }) {
  return this.gamesService.findOne(data.id);
}

// Client
const game = await client.send({ cmd: 'get_game' }, { id: '123' }).toPromise();
```

## Event-Driven with Redis

```typescript
// publisher.service.ts
@Injectable()
export class PublisherService {
  constructor(private readonly redis: RedisService) {}

  async publish(channel: string, message: unknown) {
    await this.redis.getClient().publish(channel, JSON.stringify(message));
  }
}

// subscriber.service.ts
@Injectable()
export class SubscriberService implements OnModuleInit {
  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    const client = this.redis.getClient();
    await client.subscribe('game.events', (message) => {
      const event = JSON.parse(message);
      this.handleEvent(event);
    });
  }

  private handleEvent(event: GameEvent) {
    // Handle event
  }
}
```

## Service Discovery

### Environment-Based
```typescript
const services = {
  games: process.env.GAMES_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:3003',
};
```

### Health Checks
```typescript
// Health check endpoint
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: this.checkDatabase(),
        redis: this.checkRedis(),
      },
    };
  }
}
```

## Constraints

### MUST DO
- Define clear service boundaries
- Use async communication where possible
- Implement circuit breakers
- Add health checks
- Log all inter-service calls
- Handle service failures gracefully

### MUST NOT DO
- Create tight coupling between services
- Use shared databases
- Synchronously call multiple services
- Ignore service failures
- Skip monitoring and logging
