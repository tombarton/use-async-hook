import { renderHook, act } from '@testing-library/react-hooks';
import { useAsyncHook } from '.';

describe('useAsyncHook', () => {
  it('should execute the provided async function and return the value', async () => {
    const asyncFunction = () =>
      new Promise<boolean>(res => setTimeout(() => res(true), 0));
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsyncHook<boolean>(asyncFunction)
    );

    expect(result.current[0].loading).toEqual(true);

    await waitForNextUpdate();

    expect(result.current[0].value).toEqual(true);
  });

  it('catches an error that occurs in the async function', async () => {
    const asyncFunction = () =>
      new Promise((res, rej) =>
        setTimeout(() => {
          rej(new Error('Simulated error'));
        }, 0)
      );
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsyncHook(asyncFunction)
    );

    expect(result.current[0].loading).toEqual(true);

    await waitForNextUpdate();

    expect(result.current[0].error).toEqual(new Error('Simulated error'));
  });

  it('allows the user to reset the hook to attempt the action again', async () => {
    const asyncFunction = jest.fn(
      () => new Promise<boolean>(res => setTimeout(() => res(true), 0))
    );
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsyncHook<boolean>(asyncFunction)
    );

    await act(async () => {
      expect(result.current[0].loading).toEqual(true);

      await waitForNextUpdate();

      expect(result.current[0].value).toEqual(true);

      // Attempt to run the function agian
      result.current[1]();

      await waitForNextUpdate();

      expect(result.current[0].loading).toEqual(true);
      expect(result.current[0].value).toEqual(null);

      await waitForNextUpdate();

      expect(result.current[0].value).toEqual(true);
      expect(asyncFunction).toBeCalledTimes(2);
    });
  });

  it('does not fire the async function if the component is unmounted', async () => {
    const asyncFunction = jest.fn(
      () => new Promise<boolean>(res => setTimeout(() => res(true), 0))
    );
    const { result, unmount, waitForNextUpdate } = renderHook(() =>
      useAsyncHook<boolean>(asyncFunction)
    );

    await act(async () => {
      expect(result.current[0].loading).toEqual(true);

      await waitForNextUpdate();

      expect(result.current[0].value).toEqual(true);

      // Unmount the component and attempt to fire again.
      unmount();
      result.current[1]();

      await new Promise(res => setTimeout(res, 1000));

      expect(asyncFunction).toBeCalledTimes(1);
    });
  });
});
