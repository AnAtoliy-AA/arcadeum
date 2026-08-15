'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { YStack, Typography, Button } from '@arcadeum/ui';
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
      <YStack alignItems="center" padding="$4">
        <Typography variant="body" alpha="medium">
          Creating payment request...
        </Typography>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack alignItems="center" padding="$4" gap="$3">
        <Typography variant="body" color="$red10">
          {error}
        </Typography>
        {onCancel && (
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </YStack>
    );
  }

  if (!request) return null;

  return (
    <YStack
      alignItems="center"
      padding="$4"
      gap="$3"
      style={{ minHeight: '100%' }}
    >
      <Typography variant="body" alpha="high" fontSize={16} fontWeight="bold">
        Send ARC to pay
      </Typography>

      <YStack alignItems="center" gap="$1">
        <Typography variant="caption" alpha="medium">
          Amount
        </Typography>
        <Typography
          variant="body"
          fontSize={24}
          fontWeight="bold"
          color="#22c55e"
        >
          {request.amount} ARC
        </Typography>
      </YStack>

      <YStack
        padding="$2"
        backgroundColor="white"
        borderRadius="$3"
        alignItems="center"
        width="100%"
        maxWidth={200}
      >
        <Image
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(request.solanaPayUrl)}&color=000000&bgcolor=FFFFFF&format=svg`}
          alt="Solana Pay QR Code"
          width={200}
          height={200}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          unoptimized
        />
      </YStack>

      <YStack
        alignItems="center"
        gap="$2"
        padding="$2"
        borderRadius="$3"
        backgroundColor="rgba(255,255,255,0.06)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.12)"
        width="100%"
      >
        <Typography variant="caption" alpha="medium" fontSize={11}>
          Recipient
        </Typography>
        <Typography
          variant="body"
          fontSize={11}
          color="$white"
          style={{
            wordBreak: 'break-all',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
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
      </YStack>

      <YStack gap="$2" width="100%">
        <Button
          onClick={() => {
            const url = `https://phantom.app/ul/${encodeURIComponent(request.solanaPayUrl)}`;
            window.open(url, '_blank');
          }}
          className="bg-[#ab9ff2] text-white font-bold rounded-[12px]"
          size="sm"
        >
          Open in Phantom
        </Button>
        <Button
          onClick={() => copyToClipboard(request.solanaPayUrl, 'amount')}
          variant="secondary"
          className="rounded-[12px]"
          size="sm"
        >
          {copied === 'amount' ? 'Copied!' : 'Copy Payment Link'}
        </Button>
      </YStack>

      <Typography
        variant="caption"
        alpha="low"
        textAlign="center"
        fontSize={11}
      >
        Scan the QR code or copy the address to send {request.amount} ARC
      </Typography>

      {onCancel && (
        <Button onClick={onCancel} variant="ghost" size="sm" className="mt-2">
          Cancel
        </Button>
      )}
    </YStack>
  );
}
