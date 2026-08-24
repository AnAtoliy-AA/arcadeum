'use client';

import type { ReactElement } from 'react';
import { Button, FileTextIcon } from '@arcadeum/ui';

export interface ExportPdfButtonProps {
  label?: string;
}

export function ExportPdfButton({ label }: ExportPdfButtonProps): ReactElement {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="print:hidden flex items-center gap-2 border-[var(--borderColor)] hover:border-[var(--primary)] transition-all cursor-pointer"
      data-testid="export-pdf-button"
    >
      <FileTextIcon size={16} />
      <span>{label ?? 'Save as PDF / Print'}</span>
    </Button>
  );
}
