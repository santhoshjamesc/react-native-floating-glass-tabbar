import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarStoreInstance } from './store';
import {
  createScale,
  LABEL_EXTRA_HEIGHT,
  NAV_BAR_CLEARANCE,
  type LabelMode,
  type ScaleFn,
} from './styles';

/** Default scale function, updated when the window size changes. */
export function useDefaultScale(): ScaleFn {
  const { width, height } = useWindowDimensions();
  return useMemo(() => createScale(width, height), [width, height]);
}

export type ScrollHandler = (
  event: NativeSyntheticEvent<NativeScrollEvent>
) => void;

export interface TabBarScrollHandlerOptions {
  /** Minimum scroll delta (in points) before the bar changes state. Default `8`. */
  threshold?: number;
  /** Called for every scroll event, after the bar logic runs. */
  onScroll?: ScrollHandler;
}

/**
 * Returns an `onScroll` handler that collapses the bar when scrolling down
 * and expands it when scrolling up or reaching the top.
 */
export function useTabBarScrollHandler(
  options: TabBarScrollHandlerOptions = {}
): ScrollHandler {
  const { threshold = 8, onScroll } = options;
  const store = useTabBarStoreInstance();
  const lastY = useRef(0);

  return useCallback(
    (event) => {
      const y = event.nativeEvent.contentOffset.y;
      const delta = y - lastY.current;
      lastY.current = y;

      let next: boolean | undefined;
      if (y <= 0) {
        next = false;
      } else if (delta > threshold) {
        next = true;
      } else if (delta < -threshold) {
        next = false;
      }

      if (next !== undefined && next !== store.getCollapsed()) {
        store.setCollapsed(next);
      }
      onScroll?.(event);
    },
    [store, threshold, onScroll]
  );
}

export interface TabBarClearanceOptions {
  labelMode?: LabelMode;
  /** Use the same scale function you pass to the tab bar. */
  scale?: ScaleFn;
  /** Override the base clearance (before scaling). Default `NAV_BAR_CLEARANCE` (96). */
  clearance?: number;
}

/** Bottom padding screens need so the floating bar doesn't cover content. */
export function useTabBarClearance(
  options: TabBarClearanceOptions = {}
): number {
  const { labelMode = 'none', scale, clearance = NAV_BAR_CLEARANCE } = options;
  const { bottom } = useSafeAreaInsets();
  const defaultScale = useDefaultScale();
  const s = scale ?? defaultScale;
  return (
    bottom + s(clearance) + (labelMode === 'below' ? s(LABEL_EXTRA_HEIGHT) : 0)
  );
}

/** Tracks whether the software keyboard is open. Inactive unless `enabled`. */
export function useKeyboardVisible(enabled: boolean): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(
      ios ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setVisible(true)
    );
    const hide = Keyboard.addListener(
      ios ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [enabled]);

  return visible;
}
