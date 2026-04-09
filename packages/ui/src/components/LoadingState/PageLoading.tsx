import { TamaguiProvider, Theme, YStack, XStack, styled } from 'tamagui';
import { memo } from 'react';
import tamaguiConfig from '../../tamagui.config';
import { PageLayout } from '../PageLayout/PageLayout';
import { Container } from '../Container/Container';
import { Skeleton } from '../Skeleton/Skeleton';
import { GlassCard } from '../GlassCard/GlassCard';

export interface PageLoadingProps {
  layout?: 'standard' | 'stats' | 'grid' | 'room' | 'auth';
}

const BackgroundEffect = styled(YStack, {
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  opacity: 0.25,
  background: 'radial-gradient(circle at top right, $backgroundRadialStart 0%, transparent 40%), radial-gradient(circle at bottom left, $backgroundRadialEnd 0%, transparent 40%)',
});

export const PageLoading = memo(function PageLoading({ layout = 'standard' }: PageLoadingProps) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <PageLayout>
          <BackgroundEffect />
          <Container size="xl">
            <YStack gap="$8" width="100%" paddingTop="$8">
              {/* Universal Header Area */}
              <YStack gap="$4" width="100%">
                <Skeleton height={56} width="60%" delay={0.1} />
                <Skeleton height={20} width="40%" delay={0.2} />
              </YStack>

              {/* Layout Specific Content */}
              {layout === 'grid' && (
                <XStack gap="$4" flexWrap="wrap" width="100%">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <GlassCard key={i} width={300} flexGrow={1} height={200} padding="$0" overflow="hidden" $xs={{ width: '100%' }}>
                      <Skeleton height="100%" width="100%" delay={0.2 + i * 0.05} />
                    </GlassCard>
                  ))}
                </XStack>
              )}

              {layout === 'standard' && (
                <YStack gap="$4" width="100%" maxWidth={900}>
                  <GlassCard minHeight={400} width="100%">
                    <YStack gap="$5">
                      <Skeleton height={24} width="30%" delay={0.3} />
                      <YStack gap="$3">
                        <Skeleton height={16} width="100%" delay={0.35} />
                        <Skeleton height={16} width="100%" delay={0.4} />
                        <Skeleton height={16} width="80%" delay={0.45} />
                      </YStack>
                      <Skeleton height={200} width="100%" delay={0.5} />
                    </YStack>
                  </GlassCard>
                </YStack>
              )}

              {layout === 'stats' && (
                <YStack gap="$6" width="100%">
                  <XStack gap="$4" width="100%" flexWrap="wrap">
                    {[1, 2, 3].map((i) => (
                      <GlassCard key={i} flex={1} minWidth={200} height={120}>
                        <YStack gap="$2">
                          <Skeleton height={12} width="40%" delay={0.2 + i * 0.1} />
                          <Skeleton height={32} width="80%" delay={0.3 + i * 0.1} />
                        </YStack>
                      </GlassCard>
                    ))}
                  </XStack>
                  <GlassCard height={400} width="100%">
                    <Skeleton height="100%" width="100%" delay={0.6} />
                  </GlassCard>
                </YStack>
              )}

              {layout === 'room' && (
                <XStack gap="$6" width="100%" height={600} $xs={{ flexDirection: 'column' }}>
                  <YStack flex={2} height="100%">
                    <GlassCard height="100%" width="100%" justifyContent="center" alignItems="center">
                      <Skeleton variant="circular" width={120} height={120} delay={0.3} />
                      <Skeleton height={24} width="40%" marginTop="$4" delay={0.4} />
                    </GlassCard>
                  </YStack>
                  <YStack flex={1} gap="$4" height="100%">
                    <GlassCard flex={1} width="100%">
                      <Skeleton height="100%" width="100%" delay={0.5} />
                    </GlassCard>
                    <GlassCard flex={1} width="100%">
                      <Skeleton height="100%" width="100%" delay={0.6} />
                    </GlassCard>
                  </YStack>
                </XStack>
              )}

              {layout === 'auth' && (
                <YStack ai="center" jc="center" width="100%" paddingTop="$10">
                  <GlassCard width={450} maxWidth="100%" padding="$8" ai="center">
                    <Skeleton variant="circular" width={80} height={80} mb="$6" delay={0.2} />
                    <Skeleton height={40} width="70%" mb="$4" delay={0.3} />
                    <Skeleton height={16} width="50%" mb="$8" delay={0.4} />
                    <YStack gap="$4" width="100%">
                      <Skeleton height={48} width="100%" delay={0.5} />
                      <Skeleton height={48} width="100%" delay={0.6} />
                      <Skeleton height={16} width="40%" alignSelf="center" delay={0.7} />
                    </YStack>
                  </GlassCard>
                </YStack>
              )}
            </YStack>
          </Container>
        </PageLayout>
      </Theme>
    </TamaguiProvider>
  );
});
