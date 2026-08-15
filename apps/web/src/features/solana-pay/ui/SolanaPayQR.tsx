'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Typography, Button } from '@arcadeum/ui';
import {
  createSolanaPayRequest,
  getSolanaPayStatus,
  type SolanaPayRequest,
} from '@/shared/api/solana-pay';

interface SolanaPayQRProps {
  amount: number;
  tokenAddress: string;
  onConfirmed: (signature: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function SolanaPayQR({
  amount,
  tokenAddress,
  onConfirmed,
  onError,
  onCancel,
}: SolanaPayQRProps) {
  const [request, setRequest] = useState<SolanaPayRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createRequest() {
      try {
        const req = await createSolanaPayRequest(amount, tokenAddress);
        if (!cancelled) {
          setRequest(req);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to create payment request');
          setLoading(false);
          onError?.('Failed to create payment request');
        }
      }
    }

    createRequest();
    return () => {
      cancelled = true;
    };
  }, [amount, tokenAddress, onError]);

  useEffect(() => {
    if (!request) return;

    let cancelled = false;
    let pollCount = 0;
    const maxPolls = 60;
    const currentRequest = request;

    async function pollStatus() {
      if (cancelled || pollCount >= maxPolls) return;

      try {
        const status = await getSolanaPayStatus(currentRequest.sessionId);
        if (cancelled) return;

        if (status.status === 'confirmed' && status.signature) {
          onConfirmed(status.signature);
          return;
        }

        if (status.status === 'expired') {
          setError('Payment request expired');
          onError?.('Payment request expired');
          return;
        }

        pollCount++;
        setTimeout(pollStatus, 5000);
      } catch {
        if (!cancelled) {
          pollCount++;
          setTimeout(pollStatus, 5000);
        }
      }
    }

    pollStatus();
    return () => {
      cancelled = true;
    };
  }, [request, onConfirmed, onError]);

  const copyToClipboard = useCallback(
    async (text: string, type: 'address' | 'amount') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      }
    },
    [],
  );

  if (loading) {
    return (
      <div className="box-border flex flex-col items-center p-4">
        <Typography variant="body" alpha="medium">
          Creating payment request...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="box-border flex flex-col items-center p-4 gap-3">
        <Typography className={'text-[#dc2626]'} variant="body">
          {error}
        </Typography>
        {onCancel && (
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    );
  }

  if (!request) return null;

  return (
    <div
      className="box-border flex flex-col items-center p-4 gap-3"
      style={{ minHeight: '100%' }}
    >
      <Typography
        className={'text-[16px] font-bold'}
        variant="body"
        alpha="high"
      >
        Send ARC to pay
      </Typography>

      <div className="box-border flex flex-col items-center gap-1">
        <Typography variant="caption" alpha="medium">
          Amount
        </Typography>
        <Typography
          className={'text-[24px] font-bold text-[#22c55e]'}
          variant="body"
        >
          {request.amount} ARC
        </Typography>
      </div>

      <div className="box-border flex flex-col p-2 bg-[white] rounded-xl items-center w-full max-w-[200px]">
        <Image
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(request.solanaPayUrl)}&color=000000&bgcolor=FFFFFF&format=svg`}
          alt="Solana Pay QR Code"
          width={200}
          height={200}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          unoptimized
        />
      </div>

      <div className="box-border flex flex-col items-center gap-2 p-2 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] w-full">
        <Typography className={'text-[11px]'} variant="caption" alpha="medium">
          Recipient
        </Typography>
        <Typography
          className="text-[11px] text-[#f5f7ff]"
          style={{
            wordBreak: 'break-all',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
          variant="body"
        >
          {request.recipient}
        </Typography>
        <Button
          onClick={() => copyToClipboard(request.recipient, 'address')}
          variant="ghost"
          size="sm"
        >
          {copied === 'address' ? 'Copied!' : 'Copy Address'}
        </Button>
      </div>

      <div className="box-border flex flex-col items-stretch gap-2 w-full">
        <Button
          className="bg-[#ab9ff2] text-white font-bold rounded-[12px]"
          onClick={() => {
            const url = `https://phantom.app/ul/${encodeURIComponent(request.solanaPayUrl)}`;
            window.open(url, '_blank');
          }}
          size="sm"
        >
          Open in Phantom
        </Button>
        <Button
          className="rounded-[12px]"
          onClick={() => copyToClipboard(request.solanaPayUrl, 'amount')}
          variant="secondary"
          size="sm"
        >
          {copied === 'amount' ? 'Copied!' : 'Copy Payment Link'}
        </Button>
      </div>

      <Typography
        className={'text-center text-[11px]'}
        variant="caption"
        alpha="low"
      >
        Scan the QR code or copy the address to send {request.amount} ARC
      </Typography>

      {onCancel && (
        <Button className="mt-2" onClick={onCancel} variant="ghost" size="sm">
          Cancel
        </Button>
      )}
    </div>
  );
}
