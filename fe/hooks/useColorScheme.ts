import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettings } from '@/stores/settings';

export function useColorScheme(): 'light' | 'dark' {
	const { themePreference } = useSettings();
	const systemScheme = useSystemColorScheme();

	if (themePreference === 'system') {
		return systemScheme === 'dark' ? 'dark' : 'light';
	}

	return themePreference;
}
