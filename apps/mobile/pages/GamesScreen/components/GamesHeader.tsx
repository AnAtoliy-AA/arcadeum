import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { platformShadow } from '@/lib/platformShadow';

type GamesHeaderProps = {
  onCreateRoom: () => void;
  onManualInvite: () => void;
};

export function GamesHeader({
  onCreateRoom,
  onManualInvite,
}: GamesHeaderProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">{t('games.lounge.activeTitle')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('games.lounge.activeCaption')}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.button} onPress={onCreateRoom}>
          <IconSymbol
            name="sparkles"
            size={18}
            color={styles.buttonText.color as string}
          />
          <ThemedText style={styles.buttonText}>
            {t('games.common.createRoom')}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.inviteTrigger} onPress={onManualInvite}>
        <IconSymbol
          name="lock.open"
          size={16}
          color={styles.inviteTriggerText.color as string}
        />
        <ThemedText style={styles.inviteTriggerText}>
          {t('games.lounge.haveInvite')}
        </ThemedText>
      </TouchableOpacity>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    subtitle: {
      marginTop: 6,
      color: palette.icon,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
      ...platformShadow({
        color: palette.gameRoom.surfaceShadow,
        opacity: 0.8,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 1,
      }),
    },
    buttonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    inviteTrigger: {
      marginTop: 12,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: palette.gameRoom.raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
    },
    inviteTriggerText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
  });
}
