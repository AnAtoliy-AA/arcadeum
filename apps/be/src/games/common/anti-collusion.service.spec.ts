import { Test, TestingModule } from '@nestjs/testing';
import { AntiCollusionService } from './anti-collusion.service';

describe('AntiCollusionService', () => {
  let service: AntiCollusionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AntiCollusionService],
    }).compile();

    service = module.get<AntiCollusionService>(AntiCollusionService);
  });

  describe('calculatePotRake', () => {
    it('calculates standard 3% rake on pot amount', () => {
      const result = service.calculatePotRake(1000, 0.03);
      expect(result.rakeAmount).toBe(30);
      expect(result.netPot).toBe(970);
    });

    it('applies max rake cap when exceeded', () => {
      const result = service.calculatePotRake(10000, 0.05, 100);
      expect(result.rakeAmount).toBe(100);
      expect(result.netPot).toBe(9900);
    });

    it('handles 0 or negative pot gracefully', () => {
      const result = service.calculatePotRake(0, 0.03);
      expect(result.rakeAmount).toBe(0);
      expect(result.netPot).toBe(0);
    });
  });

  describe('detectWinConcentration', () => {
    it('flags suspicious win concentration when >80% lost to one opponent', () => {
      const losses = [
        { opponentId: 'user-b', coinsLost: 900 },
        { opponentId: 'user-c', coinsLost: 100 },
      ];
      const result = service.detectWinConcentration(losses, 0.8, 500);
      expect(result.suspicious).toBe(true);
      expect(result.targetOpponentId).toBe('user-b');
      expect(result.concentrationRatio).toBe(0.9);
      expect(result.totalCoinsLost).toBe(1000);
    });

    it('returns not suspicious when losses are spread evenly', () => {
      const losses = [
        { opponentId: 'user-b', coinsLost: 250 },
        { opponentId: 'user-c', coinsLost: 250 },
        { opponentId: 'user-d', coinsLost: 250 },
        { opponentId: 'user-e', coinsLost: 250 },
      ];
      const result = service.detectWinConcentration(losses, 0.8, 500);
      expect(result.suspicious).toBe(false);
      expect(result.concentrationRatio).toBe(0.25);
    });

    it('ignores small sample sizes below minimum total lost threshold', () => {
      const losses = [{ opponentId: 'user-b', coinsLost: 20 }];
      const result = service.detectWinConcentration(losses, 0.8, 100);
      expect(result.suspicious).toBe(false);
      expect(result.totalCoinsLost).toBe(20);
    });
  });

  describe('detectRapidForfeits', () => {
    it('flags suspicious repeated rapid forfeits against the same opponent', () => {
      const matches = [
        { opponentId: 'user-b', outcome: 'forfeit' as const, durationSeconds: 10 },
        { opponentId: 'user-b', outcome: 'forfeit' as const, durationSeconds: 15 },
        { opponentId: 'user-b', outcome: 'forfeit' as const, durationSeconds: 20 },
      ];
      const result = service.detectRapidForfeits(matches, 3, 30);
      expect(result.suspicious).toBe(true);
      expect(result.targetOpponentId).toBe('user-b');
      expect(result.forfeitCount).toBe(3);
    });

    it('does not flag normal length games or mixed opponents', () => {
      const matches = [
        { opponentId: 'user-b', outcome: 'forfeit' as const, durationSeconds: 120 },
        { opponentId: 'user-c', outcome: 'win' as const, durationSeconds: 300 },
        { opponentId: 'user-b', outcome: 'loss' as const, durationSeconds: 200 },
      ];
      const result = service.detectRapidForfeits(matches, 3, 30);
      expect(result.suspicious).toBe(false);
    });
  });
});
