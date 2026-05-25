'use client';

import { Button, Badge, Card, ArrowLeftIcon, XStack } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  LoadingState,
  ErrorState,
  Section,
} from '@/shared/ui';
import type {
  HistorySummary,
  HistoryDetail,
  HistoryParticipant,
} from '../types';
import {
  DetailTimestamp,
  SectionTitle,
  SectionDescription,
  ParticipantRow,
  ParticipantInfo,
  ParticipantName,
  Checkbox,
  LogItem,
  LogHeader,
  LogTimestamp,
  LogScope,
  LogSender,
  LogMessage,
  EntryStatus,
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
    <Modal open={!!selectedEntry} onClose={onClose}>
      <ModalContent maxWidth="800px" data-testid="history-detail-modal">
        <ModalHeader onClose={onClose}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="back-button"
          >
            <ArrowLeftIcon size={16} />
            {t('history.detail.backToList')}
          </Button>
          <XStack ai="center" gap="$3">
            <ModalTitle>{selectedEntry.roomName}</ModalTitle>
            <EntryStatus data-testid="history-status">
              {t(`history.status.${selectedEntry.status}`) ||
                selectedEntry.status}
            </EntryStatus>
          </XStack>
        </ModalHeader>

        <ModalBody>
          {detailLoading ? (
            <LoadingState message={t('history.detail.loading')} />
          ) : detailError ? (
            <ErrorState message={detailError} />
          ) : detail ? (
            <>
              <DetailTimestamp>
                {t('history.detail.lastActivity', {
                  timestamp: formatDate(detail.summary.lastActivityAt),
                })}
              </DetailTimestamp>

              {isHost && (
                <Section>
                  <SectionTitle>
                    {t('history.detail.rematchTitle')}
                  </SectionTitle>
                  <SectionDescription>
                    {t('history.detail.rematchDescription')}
                  </SectionDescription>
                  {rematchError && (
                    <Badge variant="error" size="md">
                      {rematchError}
                    </Badge>
                  )}
                  <Button
                    variant="primary"
                    onClick={onStartRematch}
                    disabled={rematchLoading}
                    data-testid="rematch-button"
                  >
                    {rematchLoading
                      ? t('history.detail.rematchCreating')
                      : t('history.detail.rematchAction')}
                  </Button>
                </Section>
              )}

              <Section>
                <SectionTitle>
                  {t('history.detail.participantsTitle')}
                </SectionTitle>
                {detail.summary.participants.map((participant) => (
                  <ParticipantRow key={participant.id}>
                    <ParticipantInfo>
                      <EquippedPlayerAvatar
                        name={formatParticipantName(participant)}
                        size="sm"
                        equippedAvatarId={participant.equippedAvatarId ?? null}
                        equippedBadgeId={participant.equippedBadgeId ?? null}
                        equippedNameColorId={participant.equippedNameColorId}
                        equippedFrameId={participant.equippedFrameId}
                        equippedAuraId={participant.equippedAuraId}
                        equippedBannerId={participant.equippedBannerId}
                      />
                      <ParticipantName>
                        {formatParticipantName(participant)}
                      </ParticipantName>
                      {participant.isHost && (
                        <Badge variant="info" size="sm">
                          {t('history.detail.hostLabel')}
                        </Badge>
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
                  <Card variant="outlined" padding="md">
                    {t('history.detail.noLogs')}
                  </Card>
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
                {removeError && (
                  <Badge variant="error" size="md">
                    {removeError}
                  </Badge>
                )}
                {showRemoveConfirm ? (
                  <XStack gap="$4">
                    <Button
                      flex={1}
                      variant="secondary"
                      onClick={() => onSetShowRemoveConfirm(false)}
                    >
                      {t('history.detail.removeCancel')}
                    </Button>
                    <Button
                      flex={1}
                      variant="danger"
                      onClick={onRemove}
                      disabled={removeLoading}
                      data-testid="remove-button-confirm"
                    >
                      {removeLoading
                        ? t('history.detail.removeRemoving')
                        : t('history.detail.removeConfirm')}
                    </Button>
                  </XStack>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => onSetShowRemoveConfirm(true)}
                    data-testid="remove-button-init"
                  >
                    {t('history.detail.removeAction')}
                  </Button>
                )}
              </Section>
            </>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
