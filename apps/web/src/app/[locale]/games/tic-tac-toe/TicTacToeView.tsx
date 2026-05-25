'use client';

import { useLanguage } from '@/shared/i18n/useLanguage';
import type { TicTacToeMessages } from '@/shared/i18n/messages/games/tic-tac-toe';
import { BOARD_SIZES, type BoardSize } from './game-logic';
import { useTicTacToe } from './useTicTacToe';
import styles from './TicTacToe.module.css';

type Messages = TicTacToeMessages['tic_tac_toe'];

function getMessages(raw: unknown): Messages | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const games = (raw as { games?: Record<string, unknown> }).games;
  if (!games || typeof games !== 'object') return undefined;
  const tic = (games as { tic_tac_toe?: Messages }).tic_tac_toe;
  return tic;
}

function fontSizeFor(size: BoardSize): string {
  switch (size) {
    case 3:
      return 'clamp(36px, 9vw, 64px)';
    case 5:
      return 'clamp(24px, 6vw, 44px)';
    case 7:
      return 'clamp(18px, 4.5vw, 32px)';
    default:
      return 'clamp(14px, 3.5vw, 26px)';
  }
}

export function TicTacToeView() {
  const { messages } = useLanguage();
  const t = getMessages(messages);
  const {
    size,
    winLength,
    board,
    currentPlayer,
    winner,
    draw,
    score,
    changeSize,
    handleCellClick,
    resetGame,
    resetScore,
  } = useTicTacToe(3);

  const winningSet = new Set(winner?.line ?? []);
  const cellFontSize = fontSizeFor(size);

  const renderStatus = () => {
    if (winner) {
      return (
        <p className={`${styles.statusText} ${styles.winnerText}`}>
          {(t?.status.winner ?? 'Winner: {{player}}').replace(
            '{{player}}',
            winner.winner,
          )}
        </p>
      );
    }
    if (draw) {
      return (
        <p className={`${styles.statusText} ${styles.drawText}`}>
          {t?.status.draw ?? "It's a draw"}
        </p>
      );
    }
    const turnTpl = t?.status.turn ?? 'Turn: {{player}}';
    const [before, after] = turnTpl.split('{{player}}');
    return (
      <p className={styles.statusText}>
        {before}
        <span
          className={
            currentPlayer === 'X' ? styles.turnMarkX : styles.turnMarkO
          }
        >
          {currentPlayer}
        </span>
        {after ?? ''}
      </p>
    );
  };

  return (
    <div className={styles.page} data-testid="tic-tac-toe-page">
      <header className={styles.header}>
        <h1 className={styles.title}>{t?.title ?? 'Tic-Tac-Toe'}</h1>
        <p className={styles.subtitle}>
          {t?.subtitle ?? 'Pick a board size and play locally.'}
        </p>
      </header>

      <div
        className={styles.sizeRow}
        role="group"
        aria-label={t?.sizeGroupLabel ?? 'Board size'}
      >
        {BOARD_SIZES.map((s) => {
          const active = s === size;
          const label = (t?.sizeLabel ?? '{{n}}×{{n}}').replace(
            /{{n}}/g,
            String(s),
          );
          return (
            <button
              key={s}
              type="button"
              className={`${styles.sizeBtn} ${active ? styles.sizeBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => changeSize(s)}
              data-testid={`tic-tac-toe-size-${s}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className={styles.statusBar}>
        {renderStatus()}
        <p className={styles.rules} data-testid="tic-tac-toe-rules">
          {(t?.rules ?? 'Line up {{n}} in a row to win').replace(
            '{{n}}',
            String(winLength),
          )}
        </p>
      </div>

      <div className={styles.boardWrap}>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            fontSize: cellFontSize,
          }}
          role="grid"
          aria-label={t?.boardLabel ?? 'Game board'}
          data-testid="tic-tac-toe-board"
        >
          {board.map((cell, i) => {
            const isWin = winningSet.has(i);
            const markClass =
              cell === 'X' ? styles.cellX : cell === 'O' ? styles.cellO : '';
            const cellLabelTpl = cell
              ? (t?.cellTaken ?? 'Cell {{i}}: {{mark}}')
              : (t?.cellEmpty ?? 'Cell {{i}}: empty');
            const cellLabel = cellLabelTpl
              .replace('{{i}}', String(i + 1))
              .replace('{{mark}}', cell ?? '');
            return (
              <button
                key={i}
                type="button"
                className={`${styles.cell} ${markClass} ${isWin ? styles.cellWinning : ''}`}
                onClick={() => handleCellClick(i)}
                disabled={cell !== null || winner !== null || draw}
                aria-label={cellLabel}
                data-testid={`tic-tac-toe-cell-${i}`}
              >
                {cell ?? ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.scoreRow}>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>{t?.score.x ?? 'X wins'}</p>
          <p className={styles.scoreValue} data-testid="tic-tac-toe-score-x">
            {score.X}
          </p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>{t?.score.draws ?? 'Draws'}</p>
          <p
            className={styles.scoreValue}
            data-testid="tic-tac-toe-score-draws"
          >
            {score.draws}
          </p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>{t?.score.o ?? 'O wins'}</p>
          <p className={styles.scoreValue} data-testid="tic-tac-toe-score-o">
            {score.O}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={resetGame}
          data-testid="tic-tac-toe-new-round"
        >
          {t?.actions.newRound ?? 'New round'}
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          onClick={resetScore}
          data-testid="tic-tac-toe-reset-score"
        >
          {t?.actions.resetScore ?? 'Reset score'}
        </button>
      </div>
    </div>
  );
}
