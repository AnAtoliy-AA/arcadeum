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
  0%, 100% { box-shadow: 0 8px 32px rgba(129,140,248,0.15), 0 2px 8px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 8px 40px rgba(129,140,248,0.25), 0 2px 8px rgba(0,0,0,0.3); }
}
.game-music-player {
  animation: gameMusicPlayerIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
  transition: width 250ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 250ms ease, padding 250ms ease;
}
.game-music-player.is-playing {
  animation: gameMusicPlayerIn 300ms cubic-bezier(0.16, 1, 0.3, 1), gameMusicGlow 3s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .game-music-player { animation: gameMusicPlayerIn 300ms ease-out; }
  .game-music-player.is-playing { animation: gameMusicPlayerIn 300ms ease-out; }
}
.game-music-drag-handle {
  cursor: grab;
  border-radius: 8px;
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
  background: linear-gradient(to right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 100%);
  cursor: pointer;
  transition: height 200ms cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}
.game-music-volume:hover {
  height: 6px;
}
.game-music-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(129,140,248,0.3);
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease;
}
.game-music-volume::-webkit-slider-thumb:hover {
  transform: scale(1.25);
  box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 3px rgba(129,140,248,0.4);
}
.game-music-volume::-webkit-slider-thumb:active {
  transform: scale(1.1);
}
.game-music-volume::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(129,140,248,0.3);
  border: none;
  cursor: pointer;
}
.game-music-progress {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 100%);
  cursor: pointer;
  transition: height 200ms cubic-bezier(0.16, 1, 0.3, 1);
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
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px rgba(129,140,248,0.4);
  cursor: pointer;
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.game-music-progress:hover::-webkit-slider-thumb {
  opacity: 1;
  transform: scale(1.2);
}
.game-music-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px rgba(129,140,248,0.4);
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
  padding: 7px 10px;
  border-radius: 8px;
  transition: background-color 150ms ease, opacity 150ms ease, transform 150ms ease;
  cursor: pointer;
  margin: 0 4px;
}
.game-music-track:hover {
  background-color: rgba(255,255,255,0.06);
}
.game-music-track:active {
  transform: scale(0.98);
}
.game-music-track.active {
  background-color: rgba(129,140,248,0.12);
  border: 1px solid rgba(129,140,248,0.15);
}
.game-music-track.active:hover {
  background-color: rgba(129,140,248,0.18);
}
.game-music-checkbox {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
}
.game-music-checkbox:hover {
  border-color: rgba(255,255,255,0.5);
  transform: scale(1.1);
}
.game-music-checkbox:checked {
  background: linear-gradient(135deg, #818cf8, #6366f1);
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
  border-color: rgba(255,255,255,0.25);
  transform: none;
}
.playing-bar {
  display: inline-block;
  width: 2.5px;
  background: linear-gradient(to top, #818cf8, #a5b4fc);
  border-radius: 1px;
  animation: playingBars 0.8s ease-in-out infinite;
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
  background: linear-gradient(to top, #818cf8, #c084fc);
  border-radius: 1px;
  transition: height 80ms ease;
}
.game-music-mini {
  width: 52px !important;
  padding: 10px !important;
  gap: 0 !important;
}
.game-music-mini .game-music-title,
.game-music-mini .game-music-progress,
.game-music-mini > div:nth-child(2),
.game-music-mini > div:nth-child(3) {
  display: none !important;
}
.game-music-btn {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, color 150ms ease, box-shadow 200ms ease;
}
.game-music-btn:hover {
  background-color: rgba(255,255,255,0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.game-music-btn:active {
  transform: scale(0.9);
}
.game-music-play-btn {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, box-shadow 200ms ease;
  box-shadow: 0 2px 12px rgba(129,140,248,0.3);
}
.game-music-play-btn:hover {
  background-color: rgba(255,255,255,0.15) !important;
  box-shadow: 0 4px 16px rgba(129,140,248,0.4);
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
    padding-bottom: 14px !important;
    width: 300px !important;
    border-radius: 24px !important;
  }
  .game-music-btn {
    min-width: 48px !important;
    min-height: 48px !important;
  }
  .game-music-play-btn {
    min-width: 56px !important;
    min-height: 56px !important;
  }
  .game-music-volume,
  .game-music-progress {
    height: 6px !important;
  }
  .game-music-volume::-webkit-slider-thumb,
  .game-music-progress::-webkit-slider-thumb {
    width: 16px !important;
    height: 16px !important;
  }
  .game-music-progress::-webkit-slider-thumb {
    opacity: 1 !important;
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
