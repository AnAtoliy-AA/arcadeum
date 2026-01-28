'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  HistorySummary,
  HistoryDetail,
  HistoryParticipant,
} from '../types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  BackButton,
  ModalTitle,
  ModalLoading,
  ModalError,
  ModalBody,
  Spinner,
  ErrorText,
  DetailTimestamp,
  Section,
  SectionTitle,
  SectionDescription,
  ParticipantRow,
  ParticipantInfo,
  ParticipantIcon,
  ParticipantName,
  HostBadge,
  Checkbox,
  LogItem,
  LogHeader,
  LogTimestamp,
  LogScope,
  LogSender,
  LogMessage,
  PrimaryActionButton,
  SecondaryActionButton,
  DangerActionButton,
  ConfirmRow,
  Empty,
} from '../styles';

interface HistoryDetailModalProps {
  selectedEntry: HistorySummary;
  detail: HistoryDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  isHost: boolean;
  currentUserId: string;
  participantSelection: Record<string, boolean>;
  rematchLoading: boolean;
  rematchError: string | null;
  removeLoading: boolean;
  removeError: string | null;
  showRemoveConfirm: boolean;
  onClose: () => void;
  onToggleParticipant: (id: string, value: boolean) => void;
  onStartRematch: () => void;
  onRemove: () => void;
  onSetShowRemoveConfirm: (show: boolean) => void;
  formatParticipantName: (
    participant: HistoryParticipant | undefined | null,
  ) => string;
  formatLogMessage: (message: string) => string;
  formatDate: (dateString: string | null | undefined) => string;
}

export function HistoryDetailModal({
  selectedEntry,
  detail,
  detailLoading,
  detailError,
  isHost,
  currentUserId,
  participantSelection,
  rematchLoading,
  rematchError,
  removeLoading,
  removeError,
  showRemoveConfirm,
  onClose,
  onToggleParticipant,
  onStartRematch,
  onRemove,
  onSetShowRemoveConfirm,
  formatParticipantName,
  formatLogMessage,
  formatDate,
}: HistoryDetailModalProps) {
  const { t } = useTranslation();

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <BackButton onClick={onClose}>
            ← {t('history.detail.backToList')}
          </BackButton>
          <ModalTitle>{selectedEntry.roomName}</ModalTitle>
        </ModalHeader>

        {detailLoading ? (
          <ModalLoading>
            <Spinner />
            <div>{t('history.detail.loading')}</div>
          </ModalLoading>
        ) : detailError ? (
          <ModalError>
            <ErrorText>{detailError}</ErrorText>
          </ModalError>
        ) : detail ? (
          <ModalBody>
            <DetailTimestamp>
              {t('history.detail.lastActivity', {
                timestamp: formatDate(detail.summary.lastActivityAt),
              })}
            </DetailTimestamp>

            {isHost && (
              <Section>
                <SectionTitle>{t('history.detail.rematchTitle')}</SectionTitle>
                <SectionDescription>
                  {t('history.detail.rematchDescription')}
                </SectionDescription>
                {rematchError && <ErrorText>{rematchError}</ErrorText>}
                <PrimaryActionButton
                  onClick={onStartRematch}
                  disabled={rematchLoading}
                  data-testid="rematch-button"
                >
                  {rematchLoading
                    ? t('history.detail.rematchCreating')
                    : t('history.detail.rematchAction')}
                </PrimaryActionButton>
              </Section>
            )}

            <Section>
              <SectionTitle>
                {t('history.detail.participantsTitle')}
              </SectionTitle>
              {detail.summary.participants.map((participant) => (
                <ParticipantRow key={participant.id}>
                  <ParticipantInfo>
                    <ParticipantIcon $isHost={participant.isHost}>
                      {participant.isHost ? '👑' : '👤'}
                    </ParticipantIcon>
                    <ParticipantName>
                      {formatParticipantName(participant)}
                    </ParticipantName>
                    {participant.isHost && (
                      <HostBadge>{t('history.detail.hostLabel')}</HostBadge>
                    )}
                  </ParticipantInfo>
                  {isHost && participant.id !== currentUserId && (
                    <Checkbox
                      type="checkbox"
                      checked={participantSelection[participant.id] ?? false}
                      onChange={(e) =>
                        onToggleParticipant(participant.id, e.target.checked)
                      }
                    />
                  )}
                </ParticipantRow>
              ))}
            </Section>

            <Section>
              <SectionTitle>{t('history.detail.logsTitle')}</SectionTitle>
              {detail.logs.length === 0 ? (
                <Empty>{t('history.detail.noLogs')}</Empty>
              ) : (
                detail.logs.map((log) => (
                  <LogItem key={log.id}>
                    <LogHeader>
                      <LogTimestamp>{formatDate(log.createdAt)}</LogTimestamp>
                      <LogScope>
                        {log.scope === 'players'
                          ? t('history.detail.scopePlayers')
                          : t('history.detail.scopeAll')}
                      </LogScope>
                    </LogHeader>
                    {log.sender && (
                      <LogSender>
                        {t('history.detail.sender', {
                          name: formatParticipantName(log.sender),
                        })}
                      </LogSender>
                    )}
                    <LogMessage>{formatLogMessage(log.message)}</LogMessage>
                  </LogItem>
                ))
              )}
            </Section>

            <Section>
              <SectionTitle>{t('history.detail.removeTitle')}</SectionTitle>
              <SectionDescription>
                {t('history.detail.removeDescription')}
              </SectionDescription>
              {removeError && <ErrorText>{removeError}</ErrorText>}
              {showRemoveConfirm ? (
                <ConfirmRow>
                  <SecondaryActionButton
                    onClick={() => onSetShowRemoveConfirm(false)}
                  >
                    {t('history.detail.removeCancel')}
                  </SecondaryActionButton>
                  <DangerActionButton
                    onClick={onRemove}
                    disabled={removeLoading}
                    data-testid="remove-button-confirm"
                  >
                    {removeLoading
                      ? t('history.detail.removeRemoving')
                      : t('history.detail.removeConfirm')}
                  </DangerActionButton>
                </ConfirmRow>
              ) : (
                <DangerActionButton
                  onClick={() => onSetShowRemoveConfirm(true)}
                  data-testid="remove-button-init"
                >
                  {t('history.detail.removeAction')}
                </DangerActionButton>
              )}
            </Section>
          </ModalBody>
        ) : null}
      </ModalContent>
    </Modal>
  );
}
