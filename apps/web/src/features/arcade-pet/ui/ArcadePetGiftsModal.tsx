'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { THEME_PET_PALETTES } from '../lib/arcade-pet-economy';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';

interface ArcadePetGiftsModalProps {
  open: boolean;
  onClose: () => void;
}

const GIFT_SPECIES: readonly {
  id: PetSpecies;
  label: string;
  emoji: string;
}[] = [
  { id: 'cyber_cat', label: 'Cyber Cat', emoji: '🐱' },
  { id: 'dragon', label: 'Dragon', emoji: '🐲' },
  { id: 'dino', label: 'Dino', emoji: '🦖' },
  { id: 'blob', label: 'Blob', emoji: '🐡' },
  { id: 'slime', label: 'Slime', emoji: '👾' },
];

export function ArcadePetGiftsModal({
  open,
  onClose,
}: ArcadePetGiftsModalProps) {
  const { presents, gemBalance, claimPresent, sendGiftPet } =
    useArcadePetStore();
  const [activeTab, setActiveTab] = useState<'received' | 'send'>('received');
  const [recipient, setRecipient] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dragon');
  const [theme, setTheme] = useState<string>('fantasy');
  const [petName, setPetName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!open) return null;

  const unopenedCount = presents.filter((p) => !p.isOpened).length;

  const handleClaim = (presentId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = claimPresent(presentId);
    if (result.success && result.present) {
      setSuccessMsg(
        `Present opened! ${result.present.petName} joined your collection (+50 bonus gems)!`,
      );
    }
  };

  const handleSendGift = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!recipient.trim()) {
      setErrorMsg('Please enter friend or player name.');
      return;
    }

    const result = sendGiftPet(recipient.trim(), recipient.trim(), {
      species,
      theme,
      petName:
        petName.trim() ||
        `${THEME_PET_PALETTES[theme]?.title ?? ''} ${species}`,
      message: message.trim() || 'A friendly companion gift for you!',
    });

    if (!result.success) {
      if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(`Need 💎 50 gems to send gift. You have 💎 ${gemBalance}.`);
      } else {
        setErrorMsg('Failed to send pet gift.');
      }
      return;
    }

    setSuccessMsg(`Pet gift sent to ${recipient.trim()}!`);
    setRecipient('');
    setPetName('');
    setMessage('');
  };

  return (
    <div
      data-testid="arcade-pet-gifts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl text-white font-sans flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">
                Companion Gifts & Presents
              </span>
              <span className="text-xs text-neutral-400">
                Gift pets to friends and claim companion presents
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-indigo-300">
              <span>💎</span>
              <span>{gemBalance}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 text-sm"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
          <button
            type="button"
            data-testid="tab-received-presents"
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'received'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Take Presents</span>
            {unopenedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                {unopenedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            data-testid="tab-send-gift"
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'send'
                ? 'text-pink-400 border-b-2 border-pink-500 bg-pink-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Gift a Pet (💎 50)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200">
              {successMsg}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-3">
              <span className="text-xs text-neutral-400 block">
                Presents waiting for your pets:
              </span>

              {presents.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500 rounded-xl bg-neutral-950 border border-neutral-800">
                  No presents received yet. Meet other players in games to
                  exchange presents!
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {presents.map((present) => {
                    const palette = THEME_PET_PALETTES[present.theme];
                    return (
                      <div
                        key={present.id}
                        data-testid={`present-item-${present.id}`}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                          present.isOpened
                            ? 'border-neutral-800 bg-neutral-950/50 opacity-60'
                            : 'border-pink-500/50 bg-pink-950/20 shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ArcadePetWalkingSprite
                            species={present.species}
                            state="happy"
                            theme={present.theme}
                            className="w-10 h-10"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {present.petName}
                              {palette && (
                                <span className="text-[10px] px-1.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                                  {palette.emoji} {palette.title}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-pink-300 font-semibold">
                              From: {present.senderName}
                            </span>
                            {present.message && (
                              <span className="text-[10px] text-neutral-400 italic">
                                &ldquo;{present.message}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>

                        {present.isOpened ? (
                          <span className="text-[11px] text-neutral-500 px-3 py-1 rounded bg-neutral-900">
                            Opened
                          </span>
                        ) : (
                          <button
                            type="button"
                            data-testid={`claim-present-${present.id}`}
                            onClick={() => handleClaim(present.id)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
                          >
                            Take Present 🎁
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'send' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-pink-200">
                Gift a companion mount to another player for 💎 50 gems.
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-300 block">
                  Friend / Player Name
                </span>
                <input
                  type="text"
                  data-testid="gift-recipient-input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter friend or opponent username..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">
                  Pet Species to Gift
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {GIFT_SPECIES.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      data-testid={`gift-species-${spec.id}`}
                      onClick={() => setSpecies(spec.id)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                        species === spec.id
                          ? 'border-pink-400 bg-pink-500/20 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{spec.emoji}</span>
                      <span className="text-[10px]">{spec.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">
                  Theme Palette
                </span>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                  {Object.values(THEME_PET_PALETTES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      data-testid={`gift-theme-${t.id}`}
                      onClick={() => setTheme(t.id)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                        theme === t.id
                          ? 'border-pink-400 bg-pink-500/20 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="text-[11px] truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-300 block">
                  Gift Message
                </span>
                <input
                  type="text"
                  data-testid="gift-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Thanks for the match! Enjoy this buddy!"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="button"
                data-testid="send-pet-gift-btn"
                onClick={handleSendGift}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                Send Pet Gift (💎 50 Gems)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
