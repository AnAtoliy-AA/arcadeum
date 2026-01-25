import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { Focusable } from '@/components/ui/Focusable';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TVHomeScreen() {
  const textColor = useThemeColor({}, 'text');
  const { isUpdateAvailable, currentVersion, latestVersion, openUpdateLink } =
    useAppUpdate();

  return (
    <View style={styles.container}>
      {isUpdateAvailable && (
        <View style={styles.updateBanner}>
          <View style={styles.updateInfo}>
            <IconSymbol
              name="arrow.down.circle.fill"
              size={32}
              color="#22C55E"
            />
            <View style={styles.updateTextContainer}>
              <Text style={styles.updateTitle}>Update Available</Text>
              <Text style={styles.updateSubtitle}>
                Version {latestVersion} is available (current: {currentVersion})
              </Text>
            </View>
          </View>
          <Focusable
            onPress={openUpdateLink}
            style={styles.updateButton}
            focusStyle={styles.updateButtonFocused}
          >
            <Text style={styles.updateButtonText}>Update App</Text>
          </Focusable>
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>
          Welcome to TV Mode
        </Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Select a game from the menu to start playing.
        </Text>
        <Text style={[styles.versionText, { color: textColor }]}>
          Version {currentVersion}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    opacity: 0.7,
  },
  versionText: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 24,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  updateTextContainer: {
    gap: 4,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  updateSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  updateButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  updateButtonFocused: {
    backgroundColor: '#16A34A',
    transform: [{ scale: 1.05 }],
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
