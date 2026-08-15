'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@/shared/hooks/useInfiniteQuery';

import {
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  EmptyState,
  Skeleton,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/context';
import { formatCurrency, formatDate } from '@/shared/i18n/formatters';
import {
  paymentApi,
  PaymentNote,
  PaginatedNotes,
} from '@/features/payment/api';

const NOTES_PER_PAGE = 12;

interface NotesPageProps {
  initialData: { pages: PaginatedNotes[] } | null;
}

export default function NotesPage({ initialData }: NotesPageProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const loadTriggerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery<PaginatedNotes, number>({
      queryKey: ['payment-notes'],
      queryFn: ({ pageParam }) =>
        paymentApi.getNotes(pageParam, NOTES_PER_PAGE),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
      initialData,
    });

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const trigger = loadTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '100px',
    });
    observer.observe(trigger);

    return () => observer.disconnect();
  }, [handleIntersect]);

  const allNotes: PaymentNote[] =
    data?.pages.flatMap((page) => page.notes) ?? [];

  return (
    <PageLayout>
      <Container className={'pt-12'} size="lg">
        <div className="box-border flex flex-col items-center -mb-12">
          <PageTitle size="lg">
            {t('payments.notes.title') || 'Supporter Notes'}
          </PageTitle>
          <span className="box-border text-[rgba(236,239,238,0.7)] text-[20px] max-w-[600px] -mt-4 leading-[34px] text-center">
            {t('payments.notes.subtitle') ||
              'Messages of support from our amazing community. Thank you for keeping us going!'}
          </span>
        </div>

        {isLoading && !initialData ? (
          <div className="box-border flex flex-row items-stretch flex-wrap gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                className={'h-[140px] min-w-[300px] flex-1 rounded-[16px]'}
                key={i}
              />
            ))}
          </div>
        ) : allNotes.length === 0 ? (
          <EmptyState
            message={
              t('payments.notes.emptyMessage') ||
              'No notes yet. Be the first to leave a supportive message!'
            }
          />
        ) : (
          <>
            <div className="box-border flex flex-row items-stretch flex-wrap gap-6 min-h-[200px]">
              {allNotes.map((note) => (
                <GlassCard className={'min-w-[300px] flex-1'} key={note.id}>
                  <span className="box-border text-[var(--color)] text-[18px] leading-[34px] -mb-4 block">
                    {note.note}
                  </span>
                  <div className="box-border flex flex-row justify-between items-end gap-4 flex-wrap">
                    <div className="box-border flex flex-col items-stretch gap-1">
                      {note.displayName ? (
                        <span className="box-border text-[var(--primaryGradientStart)] font-semibold text-[18px]">
                          {note.displayName}
                        </span>
                      ) : (
                        <span className="box-border text-[rgba(236,239,238,0.45)] text-[18px] italic">
                          {t('payments.notes.anonymous') ||
                            'Anonymous Supporter'}
                        </span>
                      )}
                      <span className="box-border text-[rgba(236,239,238,0.45)] text-[14px]">
                        {formatDate(note.createdAt, locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="box-border flex flex-row items-stretch bg-[rgba(122,215,255,0.1)] border border-[rgba(122,215,255,0.3)] py-1 px-3 rounded-2xl self-end">
                      <span className="box-border text-[var(--primaryGradientStart)] text-[16px] font-semibold">
                        {formatCurrency(note.amount, locale, note.currency, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div
              ref={loadTriggerRef}
              style={{ height: 1, marginTop: '2rem' }}
            />

            {isFetchingNextPage && (
              <div className="box-border flex flex-row items-stretch justify-center py-8">
                <span className="box-border text-[rgba(236,239,238,0.45)]">
                  {t('payments.notes.loading') || 'Loading...'}
                </span>
              </div>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}
