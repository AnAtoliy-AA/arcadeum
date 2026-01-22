import styled from 'styled-components';
import { PageTitle } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const GradientTitle = styled(PageTitle).attrs({
  size: 'xl',
  gradient: true,
})`
  font-weight: 800;
  margin-bottom: 0.5rem;
  display: inline-block;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.925rem;
  max-width: 480px;
  margin: 1rem auto 0;
  line-height: 1.6;
`;

export function PaymentHeader() {
  const { t } = useTranslation();

  return (
    <HeaderSection>
      <GradientTitle>
        {t('payments.title') || 'Support the Project'}
      </GradientTitle>
      <Subtitle>
        {t('payments.subtitle') || 'Secure and fast payments powered by PayPal'}
      </Subtitle>
      <Description>
        {t('payments.description') ||
          'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations.'}
      </Description>
    </HeaderSection>
  );
}
