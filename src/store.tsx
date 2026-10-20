import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export interface TabBarStore {
  getCollapsed: () => boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Expands the bar. */
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
}

export function createTabBarStore(initialCollapsed = false): TabBarStore {
  let collapsed = initialCollapsed;
  const listeners = new Set<() => void>();

  const setCollapsed = (next: boolean) => {
    if (next === collapsed) {
      return;
    }
    collapsed = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getCollapsed: () => collapsed,
    setCollapsed,
    reset: () => setCollapsed(false),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Shared store used when no `<TabBarProvider>` is mounted. */
export const defaultTabBarStore = createTabBarStore();

const TabBarStoreContext = createContext<TabBarStore>(defaultTabBarStore);

export interface TabBarProviderProps {
  children: ReactNode;
  /** Bring your own store (e.g. to drive it from outside React). */
  store?: TabBarStore;
  initialCollapsed?: boolean;
}

/** Scopes the collapse state to a subtree. Optional: a global store is used without it. */
export function TabBarProvider({
  children,
  store,
  initialCollapsed,
}: TabBarProviderProps) {
  const [ownStore] = useState(() => createTabBarStore(initialCollapsed));
  return (
    <TabBarStoreContext.Provider value={store ?? ownStore}>
      {children}
    </TabBarStoreContext.Provider>
  );
}

/** Returns the raw store instance without subscribing to changes. */
export function useTabBarStoreInstance(): TabBarStore {
  return useContext(TabBarStoreContext);
}

export interface TabBarStoreState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

/** Subscribes to the collapse state. */
export function useTabBarStore(): TabBarStoreState {
  const store = useTabBarStoreInstance();
  const collapsed = useSyncExternalStore(
    store.subscribe,
    store.getCollapsed,
    store.getCollapsed
  );
  return useMemo(
    () => ({
      collapsed,
      setCollapsed: store.setCollapsed,
      reset: store.reset,
    }),
    [collapsed, store]
  );
}
