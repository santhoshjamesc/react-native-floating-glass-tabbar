import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  createTabBarStore,
  TabBarProvider,
  useTabBarClearance,
  useTabBarScrollHandler,
  type ScrollHandler,
} from '../index';

function scrollEvent(y: number) {
  return {
    nativeEvent: { contentOffset: { x: 0, y } },
  } as NativeSyntheticEvent<NativeScrollEvent>;
}

async function renderScrollHandler(store = createTabBarStore()) {
  let handler: ScrollHandler | undefined;
  function Probe() {
    handler = useTabBarScrollHandler();
    return null;
  }
  await render(
    <TabBarProvider store={store}>
      <Probe />
    </TabBarProvider>
  );
  return { store, scroll: (y: number) => handler!(scrollEvent(y)) };
}

describe('createTabBarStore', () => {
  it('notifies only when the value flips', () => {
    const store = createTabBarStore();
    const listener = jest.fn();
    store.subscribe(listener);
    store.setCollapsed(true);
    store.setCollapsed(true);
    store.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.getCollapsed()).toBe(false);
  });
});

describe('useTabBarScrollHandler', () => {
  it('collapses on downward scroll beyond the threshold and expands on upward', async () => {
    const { store, scroll } = await renderScrollHandler();
    scroll(5);
    expect(store.getCollapsed()).toBe(false);
    scroll(20);
    expect(store.getCollapsed()).toBe(true);
    scroll(15);
    expect(store.getCollapsed()).toBe(true);
    scroll(5);
    expect(store.getCollapsed()).toBe(false);
  });

  it('expands at the top', async () => {
    const { store, scroll } = await renderScrollHandler(
      createTabBarStore(true)
    );
    scroll(0);
    expect(store.getCollapsed()).toBe(false);
  });

  it('writes to the store only when the value flips', async () => {
    const store = createTabBarStore();
    const setCollapsed = jest.spyOn(store, 'setCollapsed');
    const { scroll } = await renderScrollHandler(store);
    scroll(20);
    scroll(40);
    scroll(60);
    expect(setCollapsed).toHaveBeenCalledTimes(1);
  });
});

describe('useTabBarClearance', () => {
  async function clearance(options?: Parameters<typeof useTabBarClearance>[0]) {
    let value = 0;
    function Probe() {
      value = useTabBarClearance({ scale: (n) => n, ...options });
      return null;
    }
    await render(<Probe />);
    return value;
  }

  it('returns safe-area bottom + 96', async () => {
    expect(await clearance()).toBe(116);
  });

  it('adds label height in below mode', async () => {
    expect(await clearance({ labelMode: 'below' })).toBe(130);
  });
});
