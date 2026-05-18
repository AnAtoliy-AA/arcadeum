import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
} from '@arcadeum/ui';

export default function AdminNotFound() {
  return (
    <PageLayout>
      <Container size="md">
        <GlassCard p="$5" data-testid="admin-not-found">
          <PageTitle size="xl" gradient>
            404
          </PageTitle>
          <Typography variant="body" uiSize="md" alpha="medium">
            Page not found.
          </Typography>
        </GlassCard>
      </Container>
    </PageLayout>
  );
}
