'use client';

import Link from 'next/link';
import { Button } from '@arcadeum/ui';

export interface ShopSignInBannerLabels {
  title: string;
  body: string;
  cta: string;
}

export interface ShopSignInBannerProps {
  labels: ShopSignInBannerLabels;
}

export function ShopSignInBanner({ labels }: ShopSignInBannerProps) {
  return (
    <div
      className="box-border flex flex-col items-stretch gap-6 p-4 rounded-2xl border border-[rgba(96,165,250,0.35)] bg-[rgba(59,130,246,0.08)]"
      data-testid="shop-signin-banner"
    >
      <span className="box-border text-[20px] font-bold">{labels.title}</span>
      <span className="box-border text-[16px] text-[#94a3b8]">
        {labels.body}
      </span>
      <div className="box-border flex flex-row items-stretch">
        <Link href="/auth">
          <Button variant="primary" data-testid="shop-signin-cta">
            {labels.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
