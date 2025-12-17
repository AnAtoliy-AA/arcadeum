import styled from "styled-components";

export const HelperText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(244, 63, 94, 0.9);
`;

export const StatusText = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.notice};
`;
