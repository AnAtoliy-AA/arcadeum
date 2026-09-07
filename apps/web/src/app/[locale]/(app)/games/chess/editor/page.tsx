'use client';

import dynamic from 'next/dynamic';

const BoardEditor = dynamic(
  () =>
    import('@/widgets/BoardGames/ChessGame/ui/BoardEditor').then(
      (m) => m.BoardEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--textSecondary)]">
          Loading board editor...
        </div>
      </div>
    ),
  },
);

export default function ChessEditorPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[1100px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-2 text-center">
          Board Editor
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Set up custom positions, configure castling rights, and export FEN
        </p>
        <BoardEditor />
      </div>
    </main>
  );
}
