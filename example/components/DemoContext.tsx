import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as Linking from 'expo-linking';
import {
  useTabBarStore,
  type LabelMode,
} from 'react-native-floating-glass-tabbar';
import { PRESETS, type Preset } from './presets';

const LABEL_MODES: LabelMode[] = ['none', 'below', 'active'];

interface DemoState {
  preset: Preset;
  cyclePreset: () => void;
  labelMode: LabelMode;
  cycleLabelMode: () => void;
  cartCount: number;
  addToCart: () => void;
  clearCart: () => void;
  isRtl: boolean;
  toggleRtl: () => void;
  /** Tint layer opacity, 0–1. */
  glassOpacity: number;
  adjustGlass: (delta: number) => void;
  /** Blur intensity, 0–100. */
  blurIntensity: number;
  adjustBlur: (delta: number) => void;
}

const DemoContext = createContext<DemoState | null>(null);

/** Deep-link params, e.g. `/cart?preset=dark&labelMode=below&cart=12&rtl=1&collapsed=1`. */
type DemoParams = Partial<
  Record<
    'preset' | 'labelMode' | 'cart' | 'rtl' | 'collapsed' | 'glass' | 'blur',
    string
  >
>;

function readParams(url: string | null): DemoParams {
  if (!url) {
    return {};
  }
  const params: DemoParams = {};
  for (const [key, value] of Object.entries(
    Linking.parse(url).queryParams ?? {}
  )) {
    if (typeof value === 'string') {
      params[key as keyof DemoParams] = value;
    }
  }
  return params;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function isLabelMode(value: string | undefined): value is LabelMode {
  return LABEL_MODES.includes(value as LabelMode);
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [labelMode, setLabelMode] = useState<LabelMode>(PRESETS[0]!.labelMode);
  const [cartCount, setCartCount] = useState(2);
  const [isRtl, setIsRtl] = useState(false);
  const [glassOpacity, setGlassOpacity] = useState(1);
  const [blurIntensity, setBlurIntensity] = useState(40);
  const { setCollapsed } = useTabBarStore();

  // Read straight from the URL: router search params update one link late.
  const url = Linking.useLinkingURL();
  useEffect(() => {
    const params = readParams(url);
    const index = PRESETS.findIndex((p) => p.name === params.preset);
    if (index >= 0) {
      setPresetIndex(index);
      setLabelMode(PRESETS[index]!.labelMode);
      setBlurIntensity(PRESETS[index]!.bar.theme?.blurIntensity ?? 40);
      setGlassOpacity(1);
    }
    if (isLabelMode(params.labelMode)) {
      setLabelMode(params.labelMode);
    }
    if (params.cart !== undefined) {
      setCartCount(Number(params.cart) || 0);
    }
    if (params.rtl !== undefined) {
      setIsRtl(params.rtl === '1');
    }
    if (params.glass !== undefined) {
      setGlassOpacity(clamp(Number(params.glass) || 0, 0, 1));
    }
    if (params.blur !== undefined) {
      setBlurIntensity(clamp(Number(params.blur) || 0, 0, 100));
    }
    if (params.collapsed !== undefined) {
      setCollapsed(params.collapsed === '1');
    }
  }, [url, setCollapsed]);

  const value = useMemo<DemoState>(
    () => ({
      preset: PRESETS[presetIndex]!,
      cyclePreset: () => {
        const next = (presetIndex + 1) % PRESETS.length;
        setPresetIndex(next);
        setLabelMode(PRESETS[next]!.labelMode);
        setBlurIntensity(PRESETS[next]!.bar.theme?.blurIntensity ?? 40);
        setGlassOpacity(1);
      },
      labelMode,
      cycleLabelMode: () =>
        setLabelMode(
          (mode) =>
            LABEL_MODES[(LABEL_MODES.indexOf(mode) + 1) % LABEL_MODES.length]!
        ),
      cartCount,
      addToCart: () => setCartCount((c) => c + 1),
      clearCart: () => setCartCount(0),
      isRtl,
      toggleRtl: () => setIsRtl((v) => !v),
      glassOpacity,
      adjustGlass: (delta) =>
        setGlassOpacity((v) => Math.round(clamp(v + delta, 0, 1) * 100) / 100),
      blurIntensity,
      adjustBlur: (delta) => setBlurIntensity((v) => clamp(v + delta, 0, 100)),
    }),
    [presetIndex, labelMode, cartCount, isRtl, glassOpacity, blurIntensity]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoState {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used inside <DemoProvider>');
  }
  return ctx;
}
