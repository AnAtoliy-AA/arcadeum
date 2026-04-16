'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@/shared/hooks/useInfiniteQuery';
import { XStack, YStack, Text } from 'tamagui';

import {
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  EmptyState,
  Skeleton,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  paymentApi,
  PaymentNote,
  PaginatedNotes,
} from '@/features/payment/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
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

interface NotesPageProps {
  initialData: { pages: PaginatedNotes[] } | null;
}

export default function NotesPage({ initialData }: NotesPageProps) {
  const { t } = useTranslation();
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

        {isLoading && !initialData ? (
          <XStack flexWrap="wrap" gap="$6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                height={140}
                minWidth={300}
                flex={1}
                borderRadius={16}
              />
            ))}
          </XStack>
        ) : allNotes.length === 0 ? (
          <EmptyState
            message={
              t('payments.notes.emptyMessage') ||
              'No notes yet. Be the first to leave a supportive message!'
            }
          />
        ) : (
          <>
            <XStack flexWrap="wrap" gap="$6" minHeight={200}>
              {allNotes.map((note) => (
                <GlassCard key={note.id} minWidth={300} flex={1}>
                  <Text
                    color="$color"
                    fontSize="$4"
                    lineHeight="$7"
                    mb="$4"
                    display="block"
                  >
                    {note.note}
                  </Text>
                  <XStack
                    jc="space-between"
                    ai="flex-end"
                    gap="$4"
                    flexWrap="wrap"
                  >
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
                    <XStack
                      backgroundColor="rgba(122,215,255,0.1)"
                      borderWidth={1}
                      borderColor="rgba(122,215,255,0.3)"
                      paddingVertical="$1"
                      paddingHorizontal="$3"
                      borderRadius="$4"
                      alignSelf="flex-end"
                    >
                      <Text
                        color="$primaryGradientStart"
                        fontSize="$3"
                        fontWeight="600"
                      >
                        {formatAmount(note.amount, note.currency)}
                      </Text>
                    </XStack>
                  </XStack>
                </GlassCard>
              ))}
            </XStack>

            <div
              ref={loadTriggerRef}
              style={{ height: 1, marginTop: '2rem' }}
            />

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
