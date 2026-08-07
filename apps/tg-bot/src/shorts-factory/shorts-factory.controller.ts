import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ShortsFactoryService,
  type PendingVideo,
} from './shorts-factory.service';

@Controller('shorts-factory')
export class ShortsFactoryController {
  private readonly logger = new Logger(ShortsFactoryController.name);

  constructor(private readonly shortsFactory: ShortsFactoryService) {}

  @Post('pending')
  @HttpCode(HttpStatus.CREATED)
  async createPending(
    @Body() body: PendingVideo,
  ): Promise<{ success: boolean; messageId?: number; pendingDir: string }> {
    this.logger.log(`Received pending video: ${body.id}`);

    const messageId = await this.shortsFactory.notifyAdmin(body);

    return {
      success: true,
      messageId,
      pendingDir: this.shortsFactory.getPendingDir(),
    };
  }

  @Get('status/:id')
  getStatus(@Param('id') id: string) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(this.shortsFactory.getPendingDir(), `${id}.json`);

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { status: 'not_found' };
    }
  }

  @Post('result')
  @HttpCode(HttpStatus.OK)
  async postResult(
    @Body()
    body: {
      id: string;
      status: 'posted' | 'failed';
      result: { success: boolean; message: string; platforms?: string[] };
    },
  ) {
    this.logger.log(`Received result for video ${body.id}: ${body.status}`);

    await this.shortsFactory.sendResultMessage(body.result);

    return { success: true };
  }
}
