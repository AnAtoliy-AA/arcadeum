import type { Meta, StoryObj } from '@storybook/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTableRow,
} from './Skeleton';
import styled from 'styled-components';

const meta: Meta<typeof Skeleton> = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'text',
      description: 'Width of skeleton',
    },
    height: {
      control: 'text',
      description: 'Height of skeleton',
    },
    variant: {
      control: 'select',
      options: ['rectangular', 'circular', 'text'],
      description: 'Shape variant',
    },
    animation: {
      control: 'select',
      options: ['shimmer', 'pulse', 'none'],
      description: 'Animation style',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2, step: 0.1 },
      description: 'Animation delay in seconds',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: '200px',
    height: '20px',
    variant: 'rectangular',
    animation: 'shimmer',
  },
};

export const Variants: Story = {
  render: () => (
    <Container>
      <Row>
        <Label>Rectangular</Label>
        <Skeleton width="150px" height="40px" variant="rectangular" />
      </Row>
      <Row>
        <Label>Circular</Label>
        <Skeleton width="50px" height="50px" variant="circular" />
      </Row>
      <Row>
        <Label>Text</Label>
        <Skeleton width="200px" height="16px" variant="text" />
      </Row>
    </Container>
  ),
};

export const Animations: Story = {
  render: () => (
    <Container>
      <Row>
        <Label>Shimmer</Label>
        <Skeleton width="200px" height="20px" animation="shimmer" />
      </Row>
      <Row>
        <Label>Pulse</Label>
        <Skeleton width="200px" height="20px" animation="pulse" />
      </Row>
      <Row>
        <Label>None</Label>
        <Skeleton width="200px" height="20px" animation="none" />
      </Row>
    </Container>
  ),
};

export const StaggeredAnimation: Story = {
  render: () => (
    <Container>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          width="200px"
          height="16px"
          variant="text"
          delay={i * 0.1}
        />
      ))}
    </Container>
  ),
};

export const ConvenienceComponents: Story = {
  render: () => (
    <Container>
      <Row>
        <Label>SkeletonText</Label>
        <SkeletonText width="180px" />
      </Row>
      <Row>
        <Label>SkeletonCircle</Label>
        <SkeletonCircle width="40px" height="40px" />
      </Row>
      <Row>
        <Label>SkeletonAvatar</Label>
        <SkeletonAvatar />
      </Row>
      <Row>
        <Label>SkeletonButton</Label>
        <SkeletonButton />
      </Row>
    </Container>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <Card>
      <SkeletonText width="60%" />
      <Skeleton width="80px" height="40px" />
      <Skeleton width="100%" height="6px" variant="text" />
    </Card>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <ProfileCard>
      <SkeletonAvatar />
      <ProfileInfo>
        <SkeletonText width="120px" />
        <SkeletonText width="80px" height="12px" />
      </ProfileInfo>
    </ProfileCard>
  ),
};

export const TableRowSkeleton: Story = {
  render: () => (
    <TableContainer>
      {[1, 2, 3].map((row) => (
        <TableRow key={row}>
          <SkeletonTableRow columns={4} delay={row * 0.1} />
        </TableRow>
      ))}
    </TableContainer>
  ),
};

export const LeaderboardSkeleton: Story = {
  render: () => (
    <LeaderboardContainer>
      {[1, 2, 3, 4, 5].map((i) => (
        <LeaderboardRow key={i}>
          <SkeletonCircle width="32px" height="32px" delay={i * 0.1} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 2,
            }}
          >
            <SkeletonAvatar delay={i * 0.1 + 0.05} />
            <SkeletonText width="120px" delay={i * 0.1 + 0.1} />
          </div>
          <SkeletonText width="40px" delay={i * 0.1 + 0.15} />
          <SkeletonText width="40px" delay={i * 0.1 + 0.2} />
          <SkeletonText width="40px" delay={i * 0.1 + 0.25} />
          <SkeletonText width="60px" delay={i * 0.1 + 0.3} />
        </LeaderboardRow>
      ))}
    </LeaderboardContainer>
  ),
};

// Styled helpers for stories
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Label = styled.span`
  width: 100px;
  font-size: 0.875rem;
  color: #666;
`;

const Card = styled.div`
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
`;

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 250px;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TableContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const LeaderboardContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
`;

const LeaderboardRow = styled.div`
  display: grid;
  grid-template-columns: 60px 2fr 80px 80px 80px 100px;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;
