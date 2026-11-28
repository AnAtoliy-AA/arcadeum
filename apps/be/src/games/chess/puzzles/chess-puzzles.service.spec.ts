import { BadRequestException } from '@nestjs/common';
import { ChessPuzzlesService } from './chess-puzzles.service';

const TWO_MATES = '7k/6pp/8/8/8/8/1R6/R5K1 w - - 0 1';

function makeService(
  puzzle: { fen: string; moves: string[]; rating: number } | null,
) {
  const exec = (value: unknown) => ({
    exec: jest.fn().mockResolvedValue(value),
  });
  const puzzleModel = {
    findOne: jest.fn().mockReturnValue(exec(puzzle)),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    create: jest
      .fn()
      .mockImplementation((doc: unknown) => Promise.resolve(doc)),
  };
  const puzzleUserModel = {
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
  };
  const service = new ChessPuzzlesService(
    puzzleModel as never,
    puzzleUserModel as never,
    {} as never,
    {} as never,
  );
  return { service, puzzleModel, puzzleUserModel };
}

describe('ChessPuzzlesService.checkSolution', () => {
  it('marks a correct player-only submission as solved', async () => {
    const { service, puzzleUserModel } = makeService({
      fen: TWO_MATES,
      moves: ['a1a8'],
      rating: 1500,
    });
    const res = await service.checkSolution('u1', 'p1', ['a1a8'], 5_000);
    expect(res.solved).toBe(true);
    expect(res.ratingChange).toBeGreaterThan(0);
    const [filter, update] = puzzleUserModel.findOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: { solved: boolean } },
    ];
    expect(filter).toEqual({ userId: 'u1', puzzleId: 'p1' });
    expect(update.$set.solved).toBe(true);
  });

  it('accepts an alternative mate and rejects a wrong move', async () => {
    const puzzle = { fen: TWO_MATES, moves: ['a1a8'], rating: 1500 };
    const ok = await makeService(puzzle).service.checkSolution(
      'u1',
      'p1',
      ['b2b8'],
      1,
    );
    expect(ok.solved).toBe(true);
    const bad = await makeService(puzzle).service.checkSolution(
      'u1',
      'p1',
      ['b2b7'],
      1,
    );
    expect(bad.solved).toBe(false);
    expect(bad.ratingChange).toBe(-5);
  });

  it('returns unsolved for an unknown puzzle', async () => {
    const res = await makeService(null).service.checkSolution(
      'u1',
      'x',
      ['a1a8'],
      1,
    );
    expect(res).toEqual({ solved: false, ratingChange: 0, puzzle: null });
  });
});

describe('ChessPuzzlesService.createCustomPuzzle', () => {
  it('rejects a line with an illegal move', async () => {
    const { service } = makeService(null);
    await expect(
      service.createCustomPuzzle('u1', { fen: TWO_MATES, moves: ['a1h8'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores a legal custom puzzle', async () => {
    const { service, puzzleModel } = makeService(null);
    await service.createCustomPuzzle('u1', { fen: TWO_MATES, moves: ['A1A8'] });
    expect(puzzleModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ moves: ['a1a8'], isCustom: true }),
    );
  });
});
