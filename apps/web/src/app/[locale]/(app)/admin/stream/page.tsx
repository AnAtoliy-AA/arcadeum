import { PageTitle, Typography } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { getTranslations } from '@/shared/i18n/server';
import { adminStreamEn } from '@/shared/i18n/messages/pages/admin-stream/en';
import { AdminStreamView } from '@/features/admin-stream/ui/AdminStreamView';
import {
  getStreamAudit,
  getStreamSettings,
  getStreamStatus,
} from '@/features/admin-stream/server/stream.server';

interface AdminStreamPageMessages {
  pages?: { adminStream?: { title?: string; subtitle?: string } };
}

/** A failed fetch becomes null so the client shows an error state with retry. */
async function orNull<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

export default async function AdminStreamPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminStreamPageMessages;
  const t = messages.pages?.adminStream ?? {};
  const [settings, status, audit] = await Promise.all([
    orNull(getStreamSettings),
    orNull(getStreamStatus),
    orNull(getStreamAudit),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          {t.title ?? adminStreamEn.title}
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="high">
          {t.subtitle ?? adminStreamEn.subtitle}
        </Typography>
      </div>
      <AdminStreamView
        initialSettings={settings}
        initialStatus={status}
        initialAudit={audit}
      />
    </div>
  );
}
