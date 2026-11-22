let originalTitle: string | null = null;

export function setRematchTabAlert(alertText: string): void {
  if (typeof document === 'undefined') return;
  if (originalTitle === null) {
    originalTitle = document.title;
  }
  document.title = `${alertText} | ${originalTitle}`;
}

export function clearRematchTabAlert(): void {
  if (typeof document === 'undefined') return;
  if (originalTitle !== null) {
    document.title = originalTitle;
    originalTitle = null;
  }
}
