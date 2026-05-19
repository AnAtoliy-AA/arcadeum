import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SupportService } from './support.service';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { OriginGuard } from './lib/origin.guard';
import { SupportThrottlerGuard } from './lib/support-throttler.guard';

@Controller('support')
// OriginGuard rejects requests whose Origin/Referer don't match the web
// app's allowed origins — blocks direct curl/server-to-server POSTs that
// bypass CORS. SupportThrottlerGuard enforces the per-IP rate limit
// declared below (skipped under E2E=true).
@UseGuards(OriginGuard, SupportThrottlerGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  // 5 submissions per hour per IP — matches the design's spam budget.
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  async submit(@Body() dto: SubmitContactDto, @Ip() ip: string) {
    return this.support.submit(dto, ip);
  }
}
