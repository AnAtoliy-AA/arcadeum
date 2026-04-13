export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setupTamagui } = await import('./shared/config/tamagui.config');
    setupTamagui();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { setupTamagui } = await import('./shared/config/tamagui.config');
    setupTamagui();
  }
}
