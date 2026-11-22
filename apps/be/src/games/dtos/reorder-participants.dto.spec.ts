import { validate } from 'class-validator';
import { ReorderParticipantsDto } from './reorder-participants.dto';

describe('ReorderParticipantsDto', () => {
  it('accepts mongoIds, guest ids, and bot ids', async () => {
    const dto = new ReorderParticipantsDto();
    dto.userIds = [
      '507f1f77bcf86cd799439011',
      'anon_0123456789abcdef',
      'bot-abcd1234ef',
    ];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects empty array or non-string items', async () => {
    const dtoEmpty = new ReorderParticipantsDto();
    dtoEmpty.userIds = [];
    const errorsEmpty = await validate(dtoEmpty);
    expect(errorsEmpty.length).toBeGreaterThan(0);

    const dtoBlank = new ReorderParticipantsDto();
    dtoBlank.userIds = [''];
    const errorsBlank = await validate(dtoBlank);
    expect(errorsBlank.length).toBeGreaterThan(0);
  });
});
