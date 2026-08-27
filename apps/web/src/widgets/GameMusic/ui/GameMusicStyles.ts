export const playerStyles = `
@keyframes gameMusicPlayerIn {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: none; }
}
@keyframes gameMusicPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes gameMusicGlow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
.game-music-player {
  animation: gameMusicPlayerIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.85),
    0 12px 24px -6px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: width 250ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 250ms ease, padding 250ms ease;
  cursor: grab;
}
.game-music-player:active {
  cursor: grabbing;
}
.game-music-player.is-dragging,
.game-music-player.is-dragging * {
  cursor: grabbing;
}
.game-music-player.is-playing {
  animation: gameMusicPlayerIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .game-music-player { animation: gameMusicPlayerIn 300ms ease-out; }
  .game-music-player.is-playing { animation: gameMusicPlayerIn 300ms ease-out; }
}
.game-music-drag-handle {
  cursor: grab;
  border-radius: 10px;
  transition: background-color 150ms ease;
  padding: 4px 6px;
  margin: -4px -6px;
}
.game-music-drag-handle:active {
  cursor: grabbing;
}
.game-music-drag-handle:hover {
  background-color: rgba(255,255,255,0.06);
}
.game-music-track-number {
  font-variant-numeric: tabular-nums;
}
.game-music-volume {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  cursor: pointer;
  transition: height 150ms ease;
  outline: none;
}
.game-music-volume:hover {
  height: 5px;
}
.game-music-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px var(--primary);
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.game-music-volume::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 6px rgba(0,0,0,0.6), 0 0 0 3px var(--accent, var(--primary));
}
.game-music-volume::-webkit-slider-thumb:active {
  transform: scale(1.05);
}
.game-music-volume::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px var(--primary);
  border: none;
  cursor: pointer;
}
.game-music-progress {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  cursor: pointer;
  transition: height 150ms ease;
  outline: none;
}
.game-music-progress:hover {
  height: 6px;
}
.game-music-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5), 0 0 0 2px var(--accent, var(--primary));
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms ease, transform 150ms ease;
}
.game-music-progress:hover::-webkit-slider-thumb {
  opacity: 1;
  transform: scale(1.15);
}
.game-music-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5), 0 0 0 2px var(--accent, var(--primary));
  border: none;
  cursor: pointer;
}
.game-music-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.game-music-playlist {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.12) transparent;
  padding: 2px 0;
  margin: 0 -4px;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
.game-music-playlist::-webkit-scrollbar {
  width: 4px;
}
.game-music-playlist::-webkit-scrollbar-track {
  background: transparent;
}
.game-music-playlist::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}
.game-music-playlist::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}
.game-music-track {
  padding: 8px 10px;
  border-radius: 8px;
  transition: background-color 150ms ease, opacity 150ms ease, transform 150ms ease;
  cursor: pointer;
  margin: 0 4px;
}
.game-music-track:hover {
  background-color: color-mix(in srgb, var(--color, #fff) 10%, transparent);
}
.game-music-track:active {
  transform: scale(0.98);
}
.game-music-track.active {
  background: linear-gradient(90deg, color-mix(in srgb, var(--primary, #6366f1) 28%, transparent) 0%, color-mix(in srgb, var(--accent, var(--primary, #818cf8)) 14%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--primary, #6366f1) 50%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.game-music-track.active:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--primary, #6366f1) 38%, transparent) 0%, color-mix(in srgb, var(--accent, var(--primary, #818cf8)) 20%, transparent) 100%);
}
.game-music-checkbox {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--borderColor, rgba(255,255,255,0.35));
  border-radius: 4px;
  background: color-mix(in srgb, var(--color, #fff) 12%, transparent);
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}
.game-music-checkbox:hover {
  border-color: var(--primary, rgba(255,255,255,0.6));
  transform: scale(1.1);
}
.game-music-checkbox:checked {
  background: linear-gradient(135deg, var(--primary, #818cf8), var(--accent, #6366f1));
  border-color: transparent;
}
.game-music-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 1px;
  width: 4px;
  height: 7px;
  border: solid #ffffff;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}
.game-music-checkbox:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  transform: none;
}
.game-music-checkbox:disabled:hover {
  border-color: var(--borderColor, rgba(255,255,255,0.25));
  transform: none;
}
.playing-bar {
  display: inline-block;
  width: 2.5px;
  background: var(--primary, #818cf8);
  border-radius: 1px;
  animation: playingBars 0.8s ease-in-out infinite;
  box-shadow: 0 0 4px var(--primary, rgba(255,255,255,0.4));
}
.playing-bar-1 { height: 8px; animation-delay: 0s; }
.playing-bar-2 { height: 12px; animation-delay: 0.15s; }
.playing-bar-3 { height: 6px; animation-delay: 0.3s; }
@keyframes playingBars {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}
.eq-bar {
  display: inline-block;
  width: 2px;
  background: linear-gradient(to top, var(--primary, #818cf8), var(--accent, #c084fc));
  border-radius: 1px;
  transition: height 80ms ease;
}
.game-music-mini {
  width: 52px;
  padding: 10px;
  gap: 0;
}
.game-music-mini .game-music-title,
.game-music-mini .game-music-progress,
.game-music-mini > div:nth-child(2),
.game-music-mini > div:nth-child(3) {
  display: none;
}
.game-music-mini-expand {
  margin-left: 8px;
}
.game-music-btn {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, color 150ms ease, box-shadow 200ms ease;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  padding: 0;
  flex-shrink: 0;
}
.game-music-btn:hover {
  --gm-btn-bg: rgba(255,255,255,0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.game-music-btn:active {
  transform: scale(0.9);
}
.game-music-play-btn {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, box-shadow 200ms ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  width: 34px;
  height: 34px;
  min-width: 34px;
  min-height: 34px;
  padding: 0;
  flex-shrink: 0;
}
.game-music-play-btn:hover {
  --gm-play-bg: rgba(129, 140, 248, 0.35);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.55);
}
.game-music-play-btn:active {
  transform: scale(0.88);
}
.game-music-time {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.game-music-volume-icon {
  transition: color 150ms ease;
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .game-music-player {
    padding-bottom: 14px;
    min-width: 320px;
    border-radius: 24px;
  }
  .game-music-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  .game-music-play-btn {
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
  }
  .game-music-volume.game-music-volume,
  .game-music-progress.game-music-progress {
    height: 6px;
  }
  .game-music-volume::-webkit-slider-thumb,
  .game-music-progress::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
  }
  .game-music-progress::-webkit-slider-thumb {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .playing-bar { animation: none; height: 6px; }
  .game-music-player,
  .game-music-player.is-playing,
  .game-music-drag-handle,
  .game-music-volume,
  .game-music-progress,
  .game-music-track,
  .game-music-checkbox,
  .eq-bar,
  .game-music-btn,
  .game-music-play-btn {
    transition: none;
  }
  .game-music-play-btn:hover {
    transform: none;
  }
  .game-music-btn:hover {
    transform: none;
  }
}
`;
