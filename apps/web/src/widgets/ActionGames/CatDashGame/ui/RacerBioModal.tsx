'use client';

import { memo, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import type { CatId } from '../types';
import { CAT_PROFILES, type CatBreedProfile } from './catData';
import { RealisticCat } from './RealisticCat';

interface RacerBioModalProps {
  open: boolean;
  onClose: () => void;
  initialCatId?: CatId;
}

const ALL_CAT_IDS: CatId[] = [
  'neon',
  'whiskers',
  'stardust',
  'felix',
  'shadow',
  'luna',
];

const STAT_PERCENTAGES: Record<number, string> = {
  74: 'w-[74%]',
  78: 'w-[78%]',
  80: 'w-[80%]',
  82: 'w-[82%]',
  85: 'w-[85%]',
  87: 'w-[87%]',
  88: 'w-[88%]',
  89: 'w-[89%]',
  90: 'w-[90%]',
  91: 'w-[91%]',
  92: 'w-[92%]',
  93: 'w-[93%]',
  94: 'w-[94%]',
  95: 'w-[95%]',
  96: 'w-[96%]',
};

export const RacerBioModal = memo(function RacerBioModal({
  open,
  onClose,
  initialCatId = 'neon',
}: RacerBioModalProps) {
  const [selectedCatId, setSelectedCatId] = useState<CatId>(initialCatId);
  const profile: CatBreedProfile =
    CAT_PROFILES[selectedCatId] ?? CAT_PROFILES.neon;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth="680px">
        <ModalHeader onClose={onClose}>
          <ModalTitle>
            <span className="flex items-center gap-2">
              <span>🏎️</span>
              <span>Racer Dossier</span>
            </span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {ALL_CAT_IDS.map((catId) => {
                const isSelected = catId === selectedCatId;
                const cat = CAT_PROFILES[catId];
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setSelectedCatId(catId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? 'bg-purple-900/50 border-purple-400 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                    }`}
                  >
                    <RealisticCat catId={catId} size={24} />
                    <span className="text-xs font-bold">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
              <div className="md:col-span-2 flex flex-col items-center gap-3">
                <div className="relative rounded-3xl p-1 bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-pink-500/30 shadow-2xl">
                  <RealisticCat
                    catId={selectedCatId}
                    size={200}
                    variant="card"
                    showGlow={true}
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-lg font-black text-white">
                    {profile.name}
                  </span>
                  <span className="text-xs font-semibold text-purple-400">
                    {profile.breedTitle}
                  </span>
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-4">
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Moniker
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    {profile.tagline}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 italic text-xs text-purple-200">
                  &ldquo;{profile.quote}&rdquo;
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                    Signature Ability
                  </span>
                  <span className="text-xs text-slate-300 font-medium leading-relaxed">
                    {profile.signatureTrait}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Performance Specs
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Speed</span>
                        <span className="text-cyan-400">
                          {profile.stats.speed}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full ${
                            STAT_PERCENTAGES[profile.stats.speed] ?? 'w-4/5'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Agility</span>
                        <span className="text-purple-400">
                          {profile.stats.agility}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${
                            STAT_PERCENTAGES[profile.stats.agility] ?? 'w-4/5'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Acceleration</span>
                        <span className="text-emerald-400">
                          {profile.stats.acceleration}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full ${
                            STAT_PERCENTAGES[profile.stats.acceleration] ??
                            'w-4/5'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Luck</span>
                        <span className="text-amber-400">
                          {profile.stats.luck}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full ${
                            STAT_PERCENTAGES[profile.stats.luck] ?? 'w-4/5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
