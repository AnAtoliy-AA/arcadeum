export const playerStyles = `
@keyframes gameMusicPlayerIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
.game-music-player {
  animation: gameMusicPlayerIn 240ms ease-out;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
  transition: width 200ms ease, border-radius 200ms ease, padding 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .game-music-player { animation: none; }
}
.game-music-drag-handle {
  cursor: grab;
  border-radius: 8px;
  transition: background-color 150ms ease;
}
.game-music-drag-handle:active {
  cursor: grabbing;
}
.game-music-drag-handle:hover {
  background-color: rgba(255,255,255,0.04);
}
.game-music-volume {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(to right, #818cf8 0%, rgba(255,255,255,0.15) 0%);
  cursor: pointer;
  transition: height 150ms ease;
}
.game-music-volume:hover {
  height: 6px;
}
.game-music-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 150ms ease;
}
.game-music-volume::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
.game-music-volume::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  border: none;
  cursor: pointer;
}
.game-music-progress {
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(to right, #818cf8 0%, rgba(255,255,255,0.15) 0%);
  cursor: pointer;
  transition: height 150ms ease;
}
.game-music-progress:hover {
  height: 5px;
}
.game-music-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms ease, transform 150ms ease;
}
.game-music-progress:hover::-webkit-slider-thumb {
  opacity: 1;
  transform: scale(1.1);
}
.game-music-progress::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  border: none;
  cursor: pointer;
}
.game-music-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.game-music-playlist {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
  padding: 2px 0;
}
.game-music-playlist::-webkit-scrollbar {
  width: 4px;
}
.game-music-playlist::-webkit-scrollbar-track {
  background: transparent;
}
.game-music-playlist::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}
.game-music-playlist::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
}
.game-music-track {
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 120ms ease, opacity 120ms ease;
  cursor: pointer;
}
.game-music-track:hover {
  background-color: rgba(255,255,255,0.06);
}
.game-music-track.active {
  background-color: rgba(129,140,248,0.12);
}
.game-music-track.active:hover {
  background-color: rgba(129,140,248,0.18);
}
.game-music-checkbox {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.game-music-checkbox:hover {
  border-color: rgba(255,255,255,0.5);
}
.game-music-checkbox:checked {
  background: #818cf8;
  border-color: #818cf8;
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
  opacity: 0.25;
  cursor: not-allowed;
}
.game-music-checkbox:disabled:hover {
  border-color: rgba(255,255,255,0.3);
}
.playing-bar {
  display: inline-block;
  width: 2.5px;
  background: #818cf8;
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
  transition: transform 150ms ease, background-color 150ms ease, color 150ms ease;
}
.game-music-btn:hover {
  background-color: rgba(255,255,255,0.08);
}
.game-music-btn:active {
  transform: scale(0.92);
}
@media (max-width: 480px) {
  .game-music-player {
    padding-bottom: 12px !important;
  }
  .game-music-btn {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .playing-bar { animation: none; height: 6px; }
  .game-music-player,
  .game-music-drag-handle,
  .game-music-volume,
  .game-music-progress,
  .game-music-track,
  .game-music-checkbox,
  .eq-bar,
  .game-music-btn {
    transition: none;
  }
}
`;
