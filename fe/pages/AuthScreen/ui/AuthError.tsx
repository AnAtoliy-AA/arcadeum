import React from 'react';
import { Text, useColorScheme, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AuthErrorProps {
  error: string;
}

export function AuthError({ error }: AuthErrorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Text style={[styles.base, { color: Colors[colorScheme].error }]}>{error}</Text>
  );
}

const styles = StyleSheet.create({
  base: {
    marginTop: 20,
  },
});
