'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { XStack, YStack, Text } from 'tamagui';

import {
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  EmptyState,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { paymentApi, PaymentNote } from '@/features/payment/api';

const notesStyles = `
  @keyframes notes-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .notes-card { position: relative; }
  .notes-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #7ad7ff, #57c3ff); border-radius: 3px 3px 0 0; }
  .notes-skeleton { position: relative; overflow: hidden; }
  .notes-skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%); animation: notes-shimmer 1.5s infinite; }
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const NOTES_PER_PAGE = 12;

export function NotesPage() {
  const { t } = useTranslation();
  const loadTriggerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['payment-notes'],
      queryFn: ({ pageParam }) =>
        paymentApi.getNotes(pageParam, NOTES_PER_PAGE),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      staleTime: 30 * 1000,
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
      <style>{notesStyles}</style>
      <Container size="lg" paddingTop="$12" paddingBottom="$16">
        <YStack ai="center" mb="$12">
          <PageTitle size="lg">
            {t('payments.notes.title') || 'Supporter Notes'}
          </PageTitle>
          <Text
            color="rgba(236,239,238,0.7)"
            fontSize="$5"
            maxWidth={600}
            mt="$4"
            lineHeight="$7"
            textAlign="center"
          >
            {t('payments.notes.subtitle') ||
              'Messages of support from our amazing community. Thank you for keeping us going!'}
          </Text>
        </YStack>

        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="notes-skeleton"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '1.5rem',
                  minHeight: 140,
                }}
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
            <div
              style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {allNotes.map((note) => (
                <GlassCard key={note.id} className="notes-card">
                  <Text
                    color="$color"
                    fontSize="$4"
                    lineHeight="$7"
                    mb="$4"
                    display="block"
                  >
                    {note.note}
                  </Text>
                  <XStack jc="space-between" ai="flex-end" gap="$4" flexWrap="wrap">
                    <YStack gap="$1">
                      {note.displayName ? (
                        <Text
                          color="$primaryGradientStart"
                          fontWeight="600"
                          fontSize="$4"
                        >
                          {note.displayName}
                        </Text>
                      ) : (
                        <Text
                          color="rgba(236,239,238,0.45)"
                          fontStyle="italic"
                          fontSize="$4"
                        >
                          {t('payments.notes.anonymous') ||
                            'Anonymous Supporter'}
                        </Text>
                      )}
                      <Text color="rgba(236,239,238,0.45)" fontSize="$2">
                        {formatDate(note.createdAt)}
                      </Text>
                    </YStack>
                    <Text
                      display="inline-flex"
                      backgroundColor="rgba(87,195,255,0.15)"
                      borderWidth={1}
                      borderColor="rgba(87,195,255,0.25)"
                      color="$primaryGradientStart"
                      paddingVertical="$2"
                      paddingHorizontal="$3"
                      borderRadius={20}
                      fontWeight="600"
                      fontSize="$3"
                      whiteSpace="nowrap"
                    >
                      {formatAmount(note.amount, note.currency)}
                    </Text>
                  </XStack>
                </GlassCard>
              ))}
            </div>

            <div ref={loadTriggerRef} style={{ height: 1, marginTop: '2rem' }} />

            {isFetchingNextPage && (
              <XStack jc="center" py="$8">
                <Text color="rgba(236,239,238,0.45)">
                  {t('payments.notes.loading') || 'Loading...'}
                </Text>
              </XStack>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}
