import type { Metadata } from 'next';
import { CoordinateTrainer } from '@/widgets/BoardGames/ChessGame/ui/CoordinateTrainer';

export const dynamic = 'force-static';
export const revalidate = 2592000;

export const metadata: Metadata = {
  title: 'Chess Coordinate Trainer · Arcadeum Games',
  description:
    'Master chess coordinates to improve your speed and communication',
};

export default function ChessLearnPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[600px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-2 text-center">
          Chess Training
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Master chess coordinates to improve your speed and communication
        </p>
        <CoordinateTrainer />
      </div>
    </main>
  );
}
