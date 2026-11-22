import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import {
  parseRematchDeepLink,
  useRematchDeepLink,
} from '../useRematchDeepLink';

describe('useRematchDeepLink', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('parseRematchDeepLink', () => {
    it('returns null for empty or invalid url', () => {
      expect(parseRematchDeepLink(null)).toBeNull();
      expect(parseRematchDeepLink(undefined)).toBeNull();
      expect(parseRematchDeepLink('')).toBeNull();
      expect(parseRematchDeepLink('mobile://other/path')).toBeNull();
    });

    it('parses custom scheme rooms path', () => {
      const result = parseRematchDeepLink('mobile://games/rooms/room-123');
      expect(result).toEqual({
        roomId: 'room-123',
        isRematchAccepted: false,
      });
    });

    it('parses rematch query params with rematch_accepted action', () => {
      const result = parseRematchDeepLink(
        'mobile://rematch?roomId=room-456&action=rematch_accepted',
      );
      expect(result).toEqual({
        roomId: 'room-456',
        isRematchAccepted: true,
      });
    });

    it('parses web https room url with type rematch_accepted', () => {
      const result = parseRematchDeepLink(
        'https://arcadeum.com/rooms/room-789?type=rematch_accepted',
      );
      expect(result).toEqual({
        roomId: 'room-789',
        isRematchAccepted: true,
      });
    });
  });

  describe('hook navigation', () => {
    it('navigates to room on initial url if present', async () => {
      jest
        .spyOn(Linking, 'getInitialURL')
        .mockResolvedValueOnce(
          'mobile://rematch?roomId=room-999&action=rematch_accepted',
        );
      const onAccepted = jest.fn();

      renderHook(() => useRematchDeepLink(onAccepted));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/games/rooms/[id]',
          params: { id: 'room-999' },
        });
      });
      expect(onAccepted).toHaveBeenCalledWith({
        roomId: 'room-999',
        isRematchAccepted: true,
      });
    });

    it('navigates when url event is fired', () => {
      let listener: ((event: { url: string }) => void) | undefined;
      jest
        .spyOn(Linking, 'addEventListener')
        .mockImplementation((event, cb) => {
          if (event === 'url') {
            listener = cb as (e: { url: string }) => void;
          }
          return { remove: jest.fn() } as unknown as ReturnType<
            typeof Linking.addEventListener
          >;
        });
      jest.spyOn(Linking, 'getInitialURL').mockResolvedValueOnce(null);

      renderHook(() => useRematchDeepLink());

      expect(listener).toBeDefined();
      act(() => {
        listener?.({ url: 'mobile://games/rooms/room-live' });
      });

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/games/rooms/[id]',
        params: { id: 'room-live' },
      });
    });
  });
});
