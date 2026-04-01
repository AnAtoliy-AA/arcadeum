import { TamaguiProvider, Theme, YStack, XStack } from 'tamagui';
import { memo } from 'react';
import tamaguiConfig from '../../tamagui.config';
import { PageLayout } from '../PageLayout/PageLayout';
import { Container } from '../Container/Container';
import { Skeleton } from '../Skeleton/Skeleton';

export interface PageLoadingProps {
  layout?: 'standard' | 'stats' | 'grid';
}

export const PageLoading = memo(function PageLoading({ layout = 'standard' }: PageLoadingProps) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <PageLayout>
          <Container>
            <YStack gap="$8" alignItems="center" width="100%">
              <YStack gap="$4" alignItems="center" width="100%">
                <Skeleton height={60} width="60%" />
                <Skeleton height={24} width="40%" />
              </YStack>

              {layout === 'grid' && (
                <XStack gap="$4" flexWrap="wrap" justifyContent="center" width="100%">
                  {[1, 2, 3].map((i) => (
                    <YStack key={i} borderRadius={12} overflow="hidden">
                      <Skeleton height={160} width={280} />
                    </YStack>
                  ))}
                </XStack>
              )}

              {layout === 'standard' && (
                <YStack
                  gap="$4"
                  width="100%"
                  maxWidth={600}
                  borderRadius={16}
                  overflow="hidden"
                >
                  <Skeleton height={400} width="100%" />
                </YStack>
              )}

              {layout === 'stats' && (
                <YStack gap="$6" width="100%">
                  <XStack gap="$4" width="100%">
                    <YStack flex={1}>
                      <Skeleton height={120} width="100%" />
                    </YStack>
                    <YStack flex={1}>
                      <Skeleton height={120} width="100%" />
                    </YStack>
                    <YStack flex={1}>
                      <Skeleton height={120} width="100%" />
                    </YStack>
                  </XStack>
                  <Skeleton height={300} width="100%" />
                </YStack>
              )}
            </YStack>
          </Container>
        </PageLayout>
      </Theme>
    </TamaguiProvider>
  );
});
