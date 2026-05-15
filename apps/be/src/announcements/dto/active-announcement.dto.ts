import { IsIn, IsOptional } from 'class-validator';
import {
  ANNOUNCEMENT_LOCALES,
  type AnnouncementLocale,
} from '../schemas/announcement.schema';

export class ActiveAnnouncementDto {
  @IsOptional()
  @IsIn(ANNOUNCEMENT_LOCALES)
  locale?: AnnouncementLocale;
}
