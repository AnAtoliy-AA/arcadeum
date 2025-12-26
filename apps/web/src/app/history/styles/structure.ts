import styled from 'styled-components';
import {
  PageLayout as SharedPageLayout,
  Container as SharedContainer,
} from '@/shared/ui';

export const Page = styled(SharedPageLayout)``;

export const Container = styled(SharedContainer).attrs({ size: 'xl' })`
  gap: 1.5rem;
`;
