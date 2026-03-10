import React from 'react';

export const MaximizeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

export const MinimizeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5m7-7-7 7 7 7" />
  </svg>
);

export const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const RefreshIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export const AppleIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.05 20.28c-.96.95-2.04 1.83-3.12 1.83-1.07 0-1.42-.66-2.66-.66-1.25 0-1.63.64-2.66.66-1.03.02-2.31-1-3.26-1.95-1.91-1.91-3.32-5.41-3.32-8.73 0-5.32 3.44-8.15 6.7-8.15 1.72 0 3.03.62 3.99 1.18.89.52 1.63 1.05 2.1 1.05.34 0 .84-.37 1.64-.9.96-.64 2.5-1.33 4.22-1.33.15 0 .29 0 .43.01-3.13 4.54-2.62 10.38 1.94 15.99-.44.82-.9 1.57-1.42 2.11L17.05 20.28zM15.02 5.09c-.11-.01-.22-.01-.33-.01-1.25 0-2.58.58-3.39 1.56-.84 1.01-1.39 2.4-1.39 3.41 0 .11.01.23.03.35 1.55.03 2.85-.73 3.65-1.8.84-1.12 1.34-2.5 1.34-3.51 0-.02 0-.01 0 0z" />
  </svg>
);

export const AndroidIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.5 13c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-11 0c-.83 0-1.5.67-1.5 1.5S5.67 16 6.5 16s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm11.72-4.07l1.39-2.41c.08-.14.03-.33-.11-.41-.14-.08-.33-.03-.41.11l-1.42 2.45c-1.33-.61-2.81-.97-4.42-.97s-3.09.36-4.42.97L7.85 6.22c-.08-.14-.27-.19-.41-.11-.14.08-.19.27-.11.41l1.39 2.41C5.64 10.35 4 12.73 4 15.5V16h16v-.5c0-2.77-1.64-5.15-4.78-6.57z" />
  </svg>
);

export const SmartphoneIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
