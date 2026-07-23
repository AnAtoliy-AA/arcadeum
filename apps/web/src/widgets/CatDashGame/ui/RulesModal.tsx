'use client';

import { memo } from 'react';
import { YStack, Text, Button, ScrollView } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
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
          <ScrollView maxHeight={400}>
            <YStack gap="$3" padding="$2">
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Goal
                </Text>
                <Text fontSize={13}>
                  Be the first cat to reach space 20 (the finish line). Each
                  turn, roll the dice and move forward that many spaces.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Dice Roll
                </Text>
                <Text fontSize={13}>
                  On your turn, click &quot;Roll Dice&quot; to move. You roll a
                  standard 6-sided die and move forward that many spaces.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Track Spaces
                </Text>
                <Text fontSize={13}>
                  🟢 Normal — no effect. 🔴 Obstacle — skip your next turn. 🟡
                  Bonus — roll again immediately. 🔵 Fork — choose a path
                  (multiple path tracks only).
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Abilities
                </Text>
                <Text fontSize={13}>
                  Each cat has 2 unique abilities. Use power tokens (3 per game)
                  to activate them. Abilities can give you extra movement, block
                  opponents, or skip obstacles.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Cats
                </Text>
                <Text fontSize={13}>
                  🐱 Neon Cat — Cyber theme. Digital Dash + Neon Shield. 🐱
                  Whiskers — Village theme. Extra Life + Purr Power. 🐱 Stardust
                  — Space theme. Warp Jump + Star Shield. 🐱 Felix — Nature
                  theme. Nature&apos;s Path + Wild Charge. 🐱 Shadow — Neon
                  theme. Shadow Step + Dark Cover. 🐱 Luna — Space theme. Lunar
                  Boost + Moon Shield.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={14}>
                  Track Types
                </Text>
                <Text fontSize={13}>
                  Linear — straightforward race. Circular — features shortcuts
                  and obstacles. Multiple Paths — choose between forks with
                  risk/reward tradeoffs.
                </Text>
              </YStack>
            </YStack>
          </ScrollView>
        </ModalBody>
        <YStack padding="$3">
          <Button onPress={onClose}>Close</Button>
        </YStack>
      </ModalContent>
    </Modal>
  );
});
