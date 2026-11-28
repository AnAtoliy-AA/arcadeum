import { QRCodeSVG } from 'qrcode.react';

/** Join QR. Static SVG on a white plate so it scans on any background. */
export function StreamQr({
  url,
  sizeClass = 'size-[7.4cqw]',
  testId = 'stream-qr',
}: {
  url: string;
  sizeClass?: string;
  testId?: string;
}) {
  return (
    <div
      className={`shrink-0 rounded-[0.7cqw] bg-white p-[0.6cqw] ${sizeClass}`}
      data-testid={testId}
      data-qr-url={url}
    >
      <QRCodeSVG
        value={url}
        marginSize={0}
        level="M"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />
    </div>
  );
}
