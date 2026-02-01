import { Platform } from 'react-native';
import { useState } from 'react';

/**
 * Hook to detect if the app is running on a TV device.
 */
export function useIsTV() {
  return Platform.isTV;
}

/**
 * Hook to handle TV remote events.
 */
// function used to handle TV remote events removed due to type incompatibility

/**
 * Hook to manage focus state for a component.
 */
export function useTVFocus() {
  const [isFocused, setIsFocused] = useState(false);

  return {
    isFocused,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };
}
