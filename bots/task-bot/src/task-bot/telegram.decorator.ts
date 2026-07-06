import { Inject } from '@nestjs/common';

export const BOT_TOKEN = 'GRAMMY_BOT';

export const InjectBot = () => Inject(BOT_TOKEN);
