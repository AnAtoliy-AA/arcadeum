import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const DownloadLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  background: #000;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  min-width: 180px;

  &:hover {
    transform: translateY(-2px);
    background: #111;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &[as='button'] {
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
`;

export const SmallText = styled.span`
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
`;

export const LargeText = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
`;
