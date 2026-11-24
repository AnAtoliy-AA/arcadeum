import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { StreamService } from './stream.service';
import { StreamServiceGuard } from './stream-service.guard';
import { StreamStatusDto } from './dto/stream-status.dto';
import { AckCommandDto } from './dto/ack-command.dto';

export const configEtag = (version: number): string => `"stream-v${version}"`;

/** True when If-None-Match lists our current ETag (weak prefix tolerated). */
export function etagMatches(header: string | undefined, etag: string): boolean {
  if (!header) return false;
  return header
    .split(',')
    .map((v) => v.trim().replace(/^W\//, ''))
    .some((v) => v === etag || v === '*');
}

/**
 * Endpoints for the stream director only (see StreamServiceGuard). The
 * director polls every few seconds, so the default throttler is skipped.
 */
@Controller('stream')
@UseGuards(StreamServiceGuard)
@SkipThrottle({ default: true, auth: true, strict: true })
export class StreamServiceController {
  constructor(private readonly service: StreamService) {}

  @Get('config')
  async getConfig(
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const view = await this.service.getConfig();
    const etag = configEtag(view.version);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, no-store');
    if (etagMatches(ifNoneMatch, etag)) {
      res.status(HttpStatus.NOT_MODIFIED);
      return;
    }
    return view;
  }

  @Get('commands')
  commands(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'private, no-store');
    return this.service.pollCommands();
  }

  @Post('commands/:id/ack')
  @HttpCode(HttpStatus.NO_CONTENT)
  ack(@Param('id') id: string, @Body() dto: AckCommandDto) {
    return this.service.ackCommand(id, dto);
  }

  @Post('status')
  @HttpCode(HttpStatus.NO_CONTENT)
  status(@Body() dto: StreamStatusDto) {
    return this.service.saveStatus(dto);
  }
}
