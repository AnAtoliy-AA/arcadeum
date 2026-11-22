import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ShortsFactoryService,
  PendingVideo,
} from './shorts-factory.service';

@Controller('shorts-factory')
export class ShortsFactoryController {
  private readonly logger = new Logger(ShortsFactoryController.name);

  constructor(private readonly service: ShortsFactoryService) {}

  @Post('pending')
  async createPending(
    @Body() pending: PendingVideo,
  ): Promise<{ success: boolean; messageId?: number }> {
    this.logger.log(`Received pending video: ${pending.id}`);

    const messageId = await this.service.notifyAdmin(pending);

    if (messageId) {
      pending.messageId = messageId;
      const filePath = path.join(
        this.service.getPendingDir(),
        `${pending.id}.json`,
      );
      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          content.messageId = messageId;
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        } catch {
          // best-effort
        }
      }
    }

    return { success: true, messageId };
  }

  @Get('status/:id')
  async getStatus(@Param('id') id: string): Promise<PendingVideo> {
    const filePath = path.join(this.service.getPendingDir(), `${id}.json`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Pending video ${id} not found`);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as PendingVideo;
    } catch {
      throw new NotFoundException(`Failed to read pending video ${id}`);
    }
  }

  @Post('result')
  async handleResult(
    @Body()
    body: {
      success?: boolean;
      message?: string;
      platforms?: string[];
      failedPlatforms?: Array<string | { platform: string; error?: string }>;
      pendingId?: string;
      id?: string;
      result?: {
        success?: boolean;
        message?: string;
        platforms?: string[];
        failedPlatforms?: Array<string | { platform: string; error?: string }>;
      };
    },
  ): Promise<{ success: boolean }> {
    const payload = body.result ?? body;
    const success = payload.success ?? body.success ?? false;
    const message = payload.message ?? body.message ?? '';
    const platforms = payload.platforms ?? body.platforms;
    const failedPlatforms = payload.failedPlatforms ?? body.failedPlatforms;

    this.logger.log(`Shorts Factory result: ${message}`);
    await this.service.sendResultMessage({
      success,
      message,
      platforms,
      failedPlatforms,
    });
    return { success: true };
  }
}
