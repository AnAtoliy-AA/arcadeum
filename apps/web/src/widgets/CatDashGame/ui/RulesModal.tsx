'use client';

import { memo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  Button,
} from '@arcadeum/ui';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export const CatDashRulesModal = memo(function CatDashRulesModal({
  open,
  onClose,
}: RulesModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader onClose={onClose}>
          <ModalTitle>Cat Dash — Rules</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="box-border overflow-auto max-h-[400px]">
            <div className="box-border flex flex-col items-stretch gap-3 p-2">
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">Goal</span>
                <span className="box-border text-[13px]">
                  Be the first cat to reach space 20 (the finish line). Each
                  turn, roll the dice and move forward that many spaces.
                </span>
              </div>
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">
                  Dice Roll
                </span>
                <span className="box-border text-[13px]">
                  On your turn, click &quot;Roll Dice&quot; to move. You roll a
                  standard 6-sided die and move forward that many spaces.
                </span>
              </div>
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">
                  Track Spaces
                </span>
                <span className="box-border text-[13px]">
                  🟢 Normal — no effect. 🔴 Obstacle — skip your next turn. 🟡
                  Bonus — roll again immediately. 🔵 Fork — choose a path
                  (multiple path tracks only).
                </span>
              </div>
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">
                  Abilities
                </span>
                <span className="box-border text-[13px]">
                  Each cat has 2 unique abilities. Use power tokens (3 per game)
                  to activate them. Abilities can give you extra movement, block
                  opponents, or skip obstacles.
                </span>
              </div>
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">Cats</span>
                <span className="box-border text-[13px]">
                  🐱 Neon Cat — Cyber theme. Digital Dash + Neon Shield. 🐱
                  Whiskers — Village theme. Extra Life + Purr Power. 🐱 Stardust
                  — Space theme. Warp Jump + Star Shield. 🐱 Felix — Nature
                  theme. Nature&apos;s Path + Wild Charge. 🐱 Shadow — Neon
                  theme. Shadow Step + Dark Cover. 🐱 Luna — Space theme. Lunar
                  Boost + Moon Shield.
                </span>
              </div>
              <div className="box-border flex flex-col items-stretch gap-1">
                <span className="box-border font-bold text-[14px]">
                  Track Types
                </span>
                <span className="box-border text-[13px]">
                  Linear — straightforward race. Circular — features shortcuts
                  and obstacles. Multiple Paths — choose between forks with
                  risk/reward tradeoffs.
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="box-border flex flex-col items-stretch p-3">
          <Button onClick={onClose}>Close</Button>
        </div>
      </ModalContent>
    </Modal>
  );
});
