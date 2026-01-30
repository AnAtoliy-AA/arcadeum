'use client';

import { useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useInfiniteQuery } from '@tanstack/react-query';

import {
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  EmptyState,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { paymentApi, PaymentNote } from '@/features/payment/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PageContainer = styled(Container)`
  padding-top: 3rem;
  padding-bottom: 4rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 1.125rem;
  max-width: 600px;
  margin: 1rem auto 0;
  line-height: 1.6;
`;

const NotesGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const NoteCard = styled(GlassCard)<{ $index: number }>`
  animation: ${fadeIn} 0.5s ease-out ${(props) => props.$index * 0.1}s backwards;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--color-accent, #57c3ff),
      var(--color-accent-secondary, #8f9bff)
    );
    opacity: 0.6;
  }
`;

const NoteContent = styled.p`
  color: var(--color-text-primary);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 1rem;
  word-wrap: break-word;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AuthorName = styled.span`
  color: var(--color-text-accent);
  font-weight: 600;
  font-size: 0.9375rem;
`;

const AnonymousLabel = styled.span`
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.9375rem;
`;

const DateLabel = styled.span`
  color: var(--color-text-muted);
  font-size: 0.8125rem;
`;

const AmountBadge = styled.span`
  background: linear-gradient(
    135deg,
    rgba(87, 195, 255, 0.15),
    rgba(143, 155, 255, 0.15)
  );
  border: 1px solid rgba(87, 195, 255, 0.25);
  color: var(--color-text-accent);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const LoadTrigger = styled.div`
  height: 1px;
  margin-top: 2rem;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  color: var(--color-text-muted);
`;

const SkeletonCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 140px;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }
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
      <PageContainer size="lg">
        <Header>
          <PageTitle size="lg">
            {t('payments.notes.title') || 'Supporter Notes'}
          </PageTitle>
          <Subtitle>
            {t('payments.notes.subtitle') ||
              'Messages of support from our amazing community. Thank you for keeping us going!'}
          </Subtitle>
        </Header>

        {isLoading ? (
          <NotesGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </NotesGrid>
        ) : allNotes.length === 0 ? (
          <EmptyState
            message={
              t('payments.notes.emptyMessage') ||
              'No notes yet. Be the first to leave a supportive message!'
            }
          />
        ) : (
          <>
            <NotesGrid>
              {allNotes.map((note, index) => (
                <NoteCard key={note.id} $index={index % 12}>
                  <NoteContent>{note.note}</NoteContent>
                  <NoteFooter>
                    <AuthorInfo>
                      {note.displayName ? (
                        <AuthorName>{note.displayName}</AuthorName>
                      ) : (
                        <AnonymousLabel>
                          {t('payments.notes.anonymous') ||
                            'Anonymous Supporter'}
                        </AnonymousLabel>
                      )}
                      <DateLabel>{formatDate(note.createdAt)}</DateLabel>
                    </AuthorInfo>
                    <AmountBadge>
                      {formatAmount(note.amount, note.currency)}
                    </AmountBadge>
                  </NoteFooter>
                </NoteCard>
              ))}
            </NotesGrid>

            <LoadTrigger ref={loadTriggerRef} />

            {isFetchingNextPage && (
              <LoadingIndicator>
                {t('payments.notes.loading') || 'Loading...'}
              </LoadingIndicator>
            )}
          </>
        )}
      </PageContainer>
    </PageLayout>
  );
}
