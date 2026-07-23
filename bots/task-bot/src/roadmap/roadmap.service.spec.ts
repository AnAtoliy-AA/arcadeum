import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RoadmapService } from './roadmap.service';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

jest.mock('fs');
jest.mock('child_process');

const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('RoadmapService', () => {
  let service: RoadmapService;

  const MOCK_ROADMAP = `
# Arcadeum Platform Expansion Plan

| Feature | ARC | Branch | Status |
|---------|-----|--------|--------|
| 1A. Stat Tracking | ARC-871 | branch | Not started |
| 1B. Emotes | ARC-872 | branch | Not started |
| 2B. Chess Engine | ARC-877 | branch | Not started |
| 2E. AI Difficulty | ARC-880 | branch | Not started |
`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        { provide: ConfigService, useValue: { get: () => '/mock/repo' } },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArcNumbersFromRoadmap', () => {
    it('should parse ARC numbers from roadmap', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);

      const result = service.getArcNumbersFromRoadmap();

      expect(result.has(871)).toBe(true);
      expect(result.has(872)).toBe(true);
      expect(result.has(877)).toBe(true);
      expect(result.has(880)).toBe(true);
      expect(result.size).toBe(4);
    });

    it('should return empty set on error', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('not found');
      });

      const result = service.getArcNumbersFromRoadmap();

      expect(result.size).toBe(0);
    });
  });

  describe('getArcNumbersFromIssues', () => {
    it('should parse ARC numbers from issues', () => {
      mockExecSync.mockReturnValue(
        JSON.stringify([
          { body: 'ARC-871 stat tracking' },
          { body: 'Some ARC-999 issue' },
        ]),
      );

      const result = service.getArcNumbersFromIssues();

      expect(result.has(871)).toBe(true);
      expect(result.has(999)).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should return empty set on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('gh not found');
      });

      const result = service.getArcNumbersFromIssues();

      expect(result.size).toBe(0);
    });
  });

  describe('getNextArcNumber', () => {
    it('should return next available after roadmap numbers', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);
      mockExecSync.mockReturnValue(JSON.stringify([]));

      const result = service.getNextArcNumber();

      expect(result).toBe('ARC-873');
    });

    it('should skip numbers used in issues', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);
      mockExecSync.mockReturnValue(
        JSON.stringify([
          { body: 'ARC-873 some issue' },
          { body: 'ARC-874 another' },
        ]),
      );

      const result = service.getNextArcNumber();

      expect(result).toBe('ARC-875');
    });
  });

  describe('matchRoadmapItem', () => {
    it('should match exact title', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);

      const result = service.matchRoadmapItem('Chess Engine');

      expect(result).not.toBeNull();
      expect(result?.arc).toBe('ARC-877');
    });

    it('should match partial title', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);

      const result = service.matchRoadmapItem('Add emotes to games');

      expect(result).not.toBeNull();
      expect(result?.arc).toBe('ARC-872');
    });

    it('should return null for no match', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);

      const result = service.matchRoadmapItem('Completely unrelated feature');

      expect(result).toBeNull();
    });

    it('should be case insensitive', () => {
      mockReadFileSync.mockReturnValue(MOCK_ROADMAP);

      const result = service.matchRoadmapItem('chess engine');

      expect(result).not.toBeNull();
      expect(result?.arc).toBe('ARC-877');
    });
  });
});
