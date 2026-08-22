'use client';

import { memo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@arcadeum/ui';
import type { HeartsVariant } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  variant: HeartsVariant;
}

export const RulesModal = memo(function RulesModal({
  open,
  onClose,
}: RulesModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Hearts Rules</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 text-sm">
            <section>
              <h3 className="font-bold mb-1">Objective</h3>
              <p className="text-[var(--text-secondary)]">
                Avoid taking Hearts (1 point each) and the Queen of Spades (13
                points). The game ends when someone reaches 100 points. Lowest
                score wins.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-1">Setup</h3>
              <p className="text-[var(--text-secondary)]">
                4 players, 52-card deck. Each player receives 13 cards.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-1">Passing Phase</h3>
              <p className="text-[var(--text-secondary)]">
                Before each hand, pass 3 cards: Left, Right, Across, then Hold
                (no pass). Rotating each hand.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-1">Gameplay</h3>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                <li>The player with 2 of Clubs leads the first trick.</li>
                <li>Must follow suit if possible.</li>
                <li>
                  Hearts cannot lead until broken (a Heart has been discarded).
                </li>
                <li>Queen of Spades may always lead once legal.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-1">Scoring</h3>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                <li>Each Heart = 1 point</li>
                <li>Queen of Spades = 13 points</li>
                <li>
                  Shoot the Moon: take all 26 points = 0 for you, 26 for
                  everyone else
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-1">Game End</h3>
              <p className="text-[var(--text-secondary)]">
                When any player reaches 100 points after a completed hand, the
                player with the lowest score wins.
              </p>
            </section>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
