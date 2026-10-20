import { Dimensions, StyleSheet } from 'react-native';
import type { BlurTint } from 'expo-blur';

export type LabelMode = 'none' | 'below' | 'active';

/** Maps a design size (based on an 844pt-tall screen) to device points. */
export type ScaleFn = (size: number) => number;

/** Reference screen height the design sizes were drawn against. */
export const BASE_SCREEN_SIZE = 844;

/** Bottom space screens should leave for the floating bar (excluding the safe-area inset). */
export const NAV_BAR_CLEARANCE = 96;
/** Gap between the bar and the safe-area bottom edge. */
export const NAV_BAR_FLOAT_GAP = 12;
export const PILL_WIDTH = 48;
export const PILL_HEIGHT = 34;
/** Extra clearance needed when labels are rendered below icons. */
export const LABEL_EXTRA_HEIGHT = 14;

export const ICON_SIZE = 22;
export const BAR_RADIUS = 28;
export const BAR_HORIZONTAL_PADDING = 16;
export const ROW_VERTICAL_PADDING = 8;
export const TAB_VERTICAL_PADDING = 6;
export const ACTIVE_PILL_INSET = 8;
export const ACTIVE_LABEL_GAP = 6;
export const BADGE_SIZE = 22;
export const BADGE_INNER_SIZE = 16;
export const COLLAPSED_SCALE = 0.88;
/** Smallest recommended tap target (Apple HIG: 44pt, Material: 48dp). */
export const MIN_TOUCH_TARGET = 44;
/** Cap on system font scaling for labels so large text can't break the bar. */
export const LABEL_MAX_FONT_SIZE_MULTIPLIER = 1.2;
/** Opacity of a tab while it is pressed. */
export const PRESSED_OPACITY = 0.7;

export interface FloatingGlassTabBarTheme {
  /** Pill and badge color. Default `#FFBD00`. */
  primary?: string;
  /** Focused icon color (and unfocused, unless `inactiveIconColor` is set). Default `#1A1A1A`. */
  iconColor?: string;
  /** Unfocused icon color. Defaults to `iconColor`. */
  inactiveIconColor?: string;
  /** App background; used for detail strokes inside filled icons. Default `#FAFAFA`. */
  background?: string;
  /** Badge count text color. Default `#1A1A1A`. */
  badgeText?: string;
  /** Overlay drawn on top of the blur. Default `rgba(255,255,255,0.85)`. */
  glassTint?: string;
  /**
   * Opacity of the `glassTint` layer, 0–1. Lower = more see-through glass,
   * `0` = blur only. Default `1`.
   */
  glassOpacity?: number;
  /** Bar border color. Default `rgba(255,255,255,0.6)`. */
  glassBorder?: string;
  /** expo-blur intensity, 0–100. Higher = stronger blur. Default `40`. */
  blurIntensity?: number;
  /** expo-blur tint. Default `'light'`. */
  blurTint?: BlurTint;
  /** Badge ring (the gap between the badge and its border). Default `#FFFFFF`. */
  badgeRing?: string;
  /** Bar shadow color. Default `#000`. */
  shadowColor?: string;
  /** Bar shadow opacity, 0–1. `0` removes the shadow. Default `0.1`. */
  shadowOpacity?: number;
  /** Bar shadow blur radius before scaling. Default `12`. */
  shadowRadius?: number;
  /** Bar shadow vertical offset before scaling. Default `4`. */
  shadowOffsetY?: number;
  /** Android elevation. Default `10`. */
  elevation?: number;
  /** Label color in `labelMode="below"`. Defaults to `iconColor`. */
  labelColor?: string;
  /** Focused label color. Defaults to `iconColor`. */
  activeLabelColor?: string;
}

export type ResolvedTheme = Required<FloatingGlassTabBarTheme>;

export const DEFAULT_THEME: Omit<
  ResolvedTheme,
  'inactiveIconColor' | 'labelColor' | 'activeLabelColor'
> = {
  primary: '#FFBD00',
  iconColor: '#1A1A1A',
  background: '#FAFAFA',
  badgeText: '#1A1A1A',
  glassTint: 'rgba(255,255,255,0.85)',
  glassOpacity: 1,
  glassBorder: 'rgba(255,255,255,0.6)',
  blurIntensity: 40,
  blurTint: 'light',
  badgeRing: '#FFFFFF',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffsetY: 4,
  elevation: 10,
};

/**
 * Dark preset. The pill stays yellow, so `iconColor` stays dark for the focused
 * icon, while unfocused icons and labels are light. In `labelMode="below"` the
 * focused label sits on the glass, so also set `activeLabelColor` to a light color.
 */
export const DARK_THEME: FloatingGlassTabBarTheme = {
  iconColor: '#1A1A1A',
  inactiveIconColor: '#F5F5F5',
  labelColor: '#F5F5F5',
  activeLabelColor: '#1A1A1A',
  glassTint: 'rgba(28,28,30,0.7)',
  glassBorder: 'rgba(255,255,255,0.12)',
  blurTint: 'dark',
  badgeRing: '#1C1C1E',
  shadowOpacity: 0.4,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function resolveTheme(theme?: FloatingGlassTabBarTheme): ResolvedTheme {
  const iconColor = theme?.iconColor ?? DEFAULT_THEME.iconColor;
  return {
    primary: theme?.primary ?? DEFAULT_THEME.primary,
    iconColor,
    inactiveIconColor: theme?.inactiveIconColor ?? iconColor,
    background: theme?.background ?? DEFAULT_THEME.background,
    badgeText: theme?.badgeText ?? DEFAULT_THEME.badgeText,
    glassTint: theme?.glassTint ?? DEFAULT_THEME.glassTint,
    glassOpacity: clamp(
      theme?.glassOpacity ?? DEFAULT_THEME.glassOpacity,
      0,
      1
    ),
    glassBorder: theme?.glassBorder ?? DEFAULT_THEME.glassBorder,
    blurIntensity: clamp(
      theme?.blurIntensity ?? DEFAULT_THEME.blurIntensity,
      0,
      100
    ),
    blurTint: theme?.blurTint ?? DEFAULT_THEME.blurTint,
    badgeRing: theme?.badgeRing ?? DEFAULT_THEME.badgeRing,
    shadowColor: theme?.shadowColor ?? DEFAULT_THEME.shadowColor,
    shadowOpacity: clamp(
      theme?.shadowOpacity ?? DEFAULT_THEME.shadowOpacity,
      0,
      1
    ),
    shadowRadius: Math.max(
      theme?.shadowRadius ?? DEFAULT_THEME.shadowRadius,
      0
    ),
    shadowOffsetY: theme?.shadowOffsetY ?? DEFAULT_THEME.shadowOffsetY,
    elevation: Math.max(theme?.elevation ?? DEFAULT_THEME.elevation, 0),
    labelColor: theme?.labelColor ?? iconColor,
    activeLabelColor: theme?.activeLabelColor ?? iconColor,
  };
}

/** Builds the default scale function for a given window size. */
export function createScale(width: number, height: number): ScaleFn {
  const ratio = Math.max(width, height) / BASE_SCREEN_SIZE;
  return (size) => ratio * size;
}

/** Non-reactive default scale based on the current window size. */
export const defaultScale: ScaleFn = (size) => {
  const { width, height } = Dimensions.get('window');
  return createScale(width, height)(size);
};

export function createStyles(s: ScaleFn) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: s(BAR_HORIZONTAL_PADDING),
      flexDirection: 'row',
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      borderRadius: s(BAR_RADIUS),
      borderWidth: 1,
    },
    clip: {
      ...StyleSheet.absoluteFill,
      borderRadius: s(BAR_RADIUS),
      overflow: 'hidden',
    },
    rtl: {
      direction: 'rtl',
    },
    ltr: {
      direction: 'ltr',
    },
    fill: {
      ...StyleSheet.absoluteFill,
    },
    row: {
      flexDirection: 'row',
      paddingTop: s(ROW_VERTICAL_PADDING),
      paddingBottom: s(ROW_VERTICAL_PADDING),
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(TAB_VERTICAL_PADDING),
    },
    // Anchors default and custom badges to the icon's top corner.
    badgeSlot: {
      position: 'absolute',
      top: -s(4),
    },
    iconWrapper: {
      width: s(PILL_WIDTH),
      height: s(PILL_HEIGHT),
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Width comes from the icon size so the inline label gets the most room.
    activeIconWrapper: {
      height: s(PILL_HEIGHT),
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(ACTIVE_LABEL_GAP),
      height: s(PILL_HEIGHT),
    },
    pill: {
      position: 'absolute',
      top: s(ROW_VERTICAL_PADDING + TAB_VERTICAL_PADDING),
      left: 0,
      height: s(PILL_HEIGHT),
      borderRadius: s(PILL_HEIGHT / 2),
    },
    labelBelow: {
      fontSize: s(11),
      fontWeight: '500',
      marginTop: s(2),
    },
    labelBelowFocused: {
      fontWeight: '700',
    },
    labelActive: {
      flexShrink: 1,
      fontSize: s(12),
      fontWeight: '700',
    },
    badge: {
      minWidth: s(BADGE_SIZE),
      height: s(BADGE_SIZE),
      paddingHorizontal: s(1),
      borderRadius: s(BADGE_SIZE / 2),
      borderWidth: s(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeInner: {
      minWidth: s(BADGE_INNER_SIZE),
      height: s(BADGE_INNER_SIZE),
      paddingHorizontal: s(2),
      borderRadius: s(BADGE_INNER_SIZE / 2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: s(12),
      lineHeight: s(BADGE_INNER_SIZE),
      fontWeight: '700',
      includeFontPadding: false,
      textAlign: 'center',
    },
  });
}

export type FloatingGlassTabBarStyles = ReturnType<typeof createStyles>;
