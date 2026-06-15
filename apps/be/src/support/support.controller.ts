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

@Controller('support')
@UseGuards(OriginGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  async submit(@Body() dto: SubmitContactDto, @Ip() ip: string) {
    return this.support.submit(dto, ip);
  }
}
