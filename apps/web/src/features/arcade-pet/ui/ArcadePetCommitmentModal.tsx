'use client';

import React, { useState } from 'react';

interface ArcadePetCommitmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ArcadePetCommitmentModal: React.FC<
  ArcadePetCommitmentModalProps
> = ({ open, onClose, onConfirm }) => {
  const [pledgeChecked, setPledgeChecked] = useState(false);

  if (!open) return null;

  const handleAdopt = () => {
    if (!pledgeChecked) return;
    onConfirm();
    onClose();
  };

  return (
    <div
      data-testid="arcade-pet-commitment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900/95 border border-indigo-500/50 p-6 shadow-2xl text-white font-sans flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥚</span>
            <div className="flex flex-col">
              <span className="text-base font-bold">
                Adopt Your First Companion
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                100% Free First Mount 🎁
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 text-sm rounded-lg hover:bg-neutral-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center py-2 text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner animate-pulse">
            ✨
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-xs">
            A pet is a faithful buddy on your gaming journey. Before bringing
            your new companion home, please confirm your commitment.
          </p>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors">
          <input
            type="checkbox"
            data-testid="care-commitment-checkbox"
            checked={pledgeChecked}
            onChange={(e) => setPledgeChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-neutral-700 text-indigo-600 focus:ring-indigo-500 bg-neutral-900 cursor-pointer"
          />
          <span className="text-xs text-neutral-200 leading-snug">
            I confirm that I want this pet and will care for him, feed him, and
            play with him!
          </span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-adopt-pet-btn"
            disabled={!pledgeChecked}
            onClick={handleAdopt}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
              pledgeChecked
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 transform hover:scale-105 active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
            }`}
          >
            Adopt Free Pet 🐾
          </button>
        </div>
      </div>
    </div>
  );
};
