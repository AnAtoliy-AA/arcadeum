'use client';

import { PageLayout, Container, PageTitle, LinkButton } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const cancelStyles = `
  @keyframes cancelFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes cancelPulse {
    0% { opacity: 0.6; }
    70% { opacity: 1; }
    100% { opacity: 0.6; }
  }

  .cancel-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2.5rem;
    padding-top: 6rem;
    animation: cancelFadeIn 0.6s ease-out;
  }

  .cancel-icon-wrapper {
    width: 90px;
    height: 90px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(239, 68, 68, 0.2);
    animation: cancelPulse 2s infinite;
  }

  .cancel-button-group {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    animation: cancelFadeIn 0.6s ease-out 0.2s backwards;
  }
`;

export default function PaymentCancelPageContent() {
  const { t } = useTranslation();

  return (
    <>
      <style>{cancelStyles}</style>
      <PageLayout>
        <Container className={'cancel-container'} size="sm">
          <div className="cancel-icon-wrapper">✕</div>

          <div>
            <PageTitle size="lg">
              {t('payments.cancelPage.title') || 'Payment Cancelled'}
            </PageTitle>
            <span
              className="text-[var(--color)] opacity-[0.7] max-w-[400px]"
              style={{ fontSize: '1rem', lineHeight: '1.6' }}
            >
              {t('payments.cancelPage.message') ||
                "No worries! No charges were made to your account. You can always try again when you're ready—we'll be here."}
            </span>
          </div>

          <div className="cancel-button-group">
            <LinkButton href="/payment" size="lg" variant="primary">
              {t('payments.cancelPage.tryAgain') || 'Try Again'}
            </LinkButton>
            <LinkButton href="/" size="lg" variant="ghost">
              {t('payments.cancelPage.returnHome') || 'Return Home'}
            </LinkButton>
          </div>
        </Container>
      </PageLayout>
    </>
  );
}
