import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AuthErrorProps {
  error: string;
}

export function AuthError({ error }: AuthErrorProps) {
  const { colorScheme } = useColorScheme();
  return (
    <Text style={[styles.base, { color: Colors[colorScheme].error }]}>
      {error}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    marginTop: 20,
  },
});
