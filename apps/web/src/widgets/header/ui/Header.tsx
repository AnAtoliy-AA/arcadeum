'use client';
import { HeaderLayout } from './HeaderLayout';
import { HeaderInteractive } from './HeaderInteractive';
import { useIsMounted } from './useIsMounted';

export function Header() {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <HeaderLayout>
      <HeaderInteractive />
    </HeaderLayout>
  );
}
