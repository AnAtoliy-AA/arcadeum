interface IconProps {
  size?: number;
}

export function GoogleGlyph({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.36.61 4.61 1.81l3.43-3.43C17.92 1.27 15.18 0 12 0 7.31 0 3.25 2.69 1.28 6.61l3.99 3.1C6.22 6.77 8.87 4.75 12 4.75z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.07-1.66-.21-2.45H12v4.64h6.45c-.28 1.5-1.13 2.77-2.41 3.62l3.87 3.01c2.26-2.08 3.58-5.16 3.58-8.82z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.27 7.27 0 0 1-.38-2.29c0-.79.14-1.56.38-2.29l-3.99-3.1A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.1z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.02-6.73-4.95l-3.99 3.1C3.25 21.31 7.31 24 12 24z"
      />
      <path fill="none" d="M0 0h24v24H0z" />
    </svg>
  );
}

export function AppleGlyph({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.05 12.04c-.03-2.79 2.28-4.13 2.38-4.2-1.3-1.9-3.32-2.16-4.04-2.19-1.72-.17-3.36 1.01-4.24 1.01-.88 0-2.22-.99-3.65-.96-1.88.03-3.62 1.09-4.59 2.77-1.96 3.4-.5 8.42 1.41 11.18.93 1.35 2.04 2.86 3.5 2.81 1.41-.06 1.94-.91 3.65-.91 1.71 0 2.18.91 3.66.88 1.51-.03 2.47-1.38 3.4-2.74 1.07-1.57 1.51-3.09 1.54-3.17-.03-.01-2.96-1.13-2.99-4.48zM14.5 4.06c.78-.94 1.3-2.25 1.16-3.55-1.12.05-2.48.75-3.28 1.69-.72.84-1.35 2.17-1.18 3.45 1.25.09 2.52-.65 3.3-1.59z" />
    </svg>
  );
}

export function DiscordGlyph({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#5865F2"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M20.317 4.369A19.789 19.789 0 0 0 16.557 3a.074.074 0 0 0-.079.037 13.79 13.79 0 0 0-.61 1.249 18.27 18.27 0 0 0-5.487 0 12.65 12.65 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 5.926 4.37a.07.07 0 0 0-.032.027C2.41 9.452 1.522 14.41 1.96 19.302a.082.082 0 0 0 .031.056 19.91 19.91 0 0 0 5.993 3.029.078.078 0 0 0 .084-.028 14.23 14.23 0 0 0 1.226-1.994.076.076 0 0 0-.041-.105 13.122 13.122 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.197.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.892.077.077 0 0 0-.04.106 16.06 16.06 0 0 0 1.226 1.993.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055c.5-5.638-.838-10.554-3.549-14.906a.06.06 0 0 0-.031-.028zM8.02 16.339c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.973 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function MailGlyph({ size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function PlusGlyph({ size = 12 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}

export function SparkleGlyph({ size = 10 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" />
    </svg>
  );
}

export function CheckGlyph({ size = 12 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polyline points="3 8 7 12 13 4" />
    </svg>
  );
}

export function ArrowGlyph({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  );
}

