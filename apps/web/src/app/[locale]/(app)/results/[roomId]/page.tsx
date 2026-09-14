import type { Metadata } from 'next';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { ResultCardView } from './ResultCardView';

export const dynamic = 'force-dynamic';

interface ResultPageProps {
  params: Promise<{ roomId: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { roomId } = await params;

  try {
    const res = await fetch(resolveApiUrl(`/games/rooms/${roomId}/result`), {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { title: 'Game Result — Arcadeum Games' };
    const data: {
      gameName: string;
      participants: Array<{ displayName: string; isWinner: boolean }>;
      isDraw: boolean;
    } = await res.json();

    const resultText = data.isDraw
      ? 'Draw'
      : data.participants.find((p) => p.isWinner)?.displayName
        ? `${data.participants.find((p) => p.isWinner)!.displayName} won!`
        : 'Game completed';

    return {
      title: `${data.gameName} Result — Arcadeum Games`,
      description: `${resultText} — played on Arcadeum Games`,
      openGraph: {
        title: `${data.gameName} — Arcadeum Games`,
        description: resultText,
        images: [
          {
            url: `/results/${roomId}/opengraph-image`,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${data.gameName} — Arcadeum Games`,
        description: resultText,
      },
    };
  } catch {
    return { title: 'Game Result — Arcadeum Games' };
  }
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { roomId } = await params;

  let result: {
    sessionId: string;
    roomId: string;
    gameId: string;
    gameName: string;
    completedAt: string;
    isDraw: boolean;
    participants: Array<{
      userId: string;
      displayName: string;
      isWinner: boolean;
    }>;
    ratingDeltas?: Record<string, number>;
  } | null = null;

  try {
    const res = await fetch(resolveApiUrl(`/games/rooms/${roomId}/result`), {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      result = await res.json();
    }
  } catch {
    // result stays null
  }

  return <ResultCardView roomId={roomId} result={result} />;
}
