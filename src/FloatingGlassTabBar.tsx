import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BlurView, type BlurViewProps } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useDefaultScale, useKeyboardVisible } from './hooks';
import { TabBarIconContext, type TabBarIconComponent } from './icons';
import { useTabBarStore } from './store';
import {
  ACTIVE_PILL_INSET,
  BADGE_SIZE,
  COLLAPSED_SCALE,
  createStyles,
  ICON_SIZE,
  LABEL_MAX_FONT_SIZE_MULTIPLIER,
  MIN_TOUCH_TARGET,
  NAV_BAR_FLOAT_GAP,
  PRESSED_OPACITY,
  PILL_WIDTH,
  resolveTheme,
  type FloatingGlassTabBarStyles,
  type FloatingGlassTabBarTheme,
  type LabelMode,
  type ResolvedTheme,
  type ScaleFn,
} from './styles';

export interface TabConfig {
  icon: TabBarIconComponent;
  label: string;
}

/** Keyed by route name. Routes without an entry are not rendered. */
export type TabsConfig = Record<string, TabConfig>;

export interface SpringConfig {
  bounciness?: number;
  speed?: number;
}

/** The route options the bar reads. */
export type TabBarRouteOptions = Pick<
  BottomTabNavigationOptions,
  | 'tabBarBadge'
  | 'tabBarAccessibilityLabel'
  | 'tabBarButtonTestID'
  | 'tabBarItemStyle'
>;

export interface TabBarRoute {
  key: string;
  name: string;
  params?: object;
}

export interface TabBarNavigation {
  emit: (
    event:
      | { type: 'tabPress'; target: string; canPreventDefault: true }
      | { type: 'tabLongPress'; target: string }
  ) => { readonly type: string; readonly defaultPrevented?: boolean };
  navigate: (name: string, params?: object) => void;
}

/**
 * The subset of `BottomTabBarProps` the bar reads. It's structural so both
 * `@react-navigation/bottom-tabs` and expo-router's bundled navigator fit.
 */
export interface TabBarNavigationProps {
  state: { index: number; routes: readonly TabBarRoute[] };
  descriptors: Record<string, { options: TabBarRouteOptions } | undefined>;
  navigation: TabBarNavigation;
  insets?: BottomTabBarProps['insets'];
}

export interface FloatingGlassTabBarProps extends TabBarNavigationProps {
  tabs: TabsConfig;
  /** Default `'none'`. */
  labelMode?: LabelMode;
  theme?: FloatingGlassTabBarTheme;
  /** Override the size scaling. Default `(size) => (max(screenW, screenH) / 844) * size`. */
  scale?: ScaleFn;
  /** Default `I18nManager.isRTL`. */
  isRtl?: boolean;
  /** Controlled collapse state. Overrides the built-in store. */
  collapsed?: boolean;
  /** Scale applied when collapsed. Default `0.88`. */
  collapsedScale?: number;
  /** Icon size before scaling. Default `22`. */
  iconSize?: number;
  /** Gap between the bar and the safe-area bottom, before scaling. Default `12`. */
  floatGap?: number;
  /** Maximum bar width (before scaling) for tablets and landscape. Default: full width. */
  maxWidth?: number;
  /** Minimum tab height in points (not scaled). Default `44`. */
  minTouchTarget?: number;
  /** Opacity of a tab while pressed, 0–1. Use `1` to disable. Default `0.7`. */
  pressedOpacity?: number;
  /** Cap on system font scaling for labels. Default `1.2`. */
  labelMaxFontSizeMultiplier?: number;
  /** Fade the bar out while the software keyboard is open. Default `false`. */
  hideOnKeyboard?: boolean;
  /** Badge counts above this show as `${maxBadgeCount}+`. Default `99`. */
  maxBadgeCount?: number;
  /** Expand the bar when a tab is pressed. Default `true`. */
  resetOnTabPress?: boolean;
  /** Spring for the sliding pill. Default `{ bounciness: 6, speed: 16 }`. */
  pillSpring?: SpringConfig;
  /** Spring for collapse/expand. Default `{ bounciness: 4, speed: 14 }`. */
  collapseSpring?: SpringConfig;
  /** Extra props for the expo-blur `BlurView` (e.g. `blurMethod`, `blurTarget` on Android). */
  blurProps?: Omit<BlurViewProps, 'intensity' | 'tint' | 'style'>;
  /** Replace the blur + tint layers with your own background. */
  renderBackground?: () => ReactNode;
  renderBadge?: (count: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
}

type Route = TabBarRoute;

const DEFAULT_PILL_SPRING = { bounciness: 6, speed: 16 };
const DEFAULT_COLLAPSE_SPRING = { bounciness: 4, speed: 14 };

function isRouteHidden(options: TabBarRouteOptions | undefined) {
  if (!options) {
    return false;
  }
  // expo-router strips `href` and hides the item via `display: 'none'`.
  if ((options as { href?: unknown }).href === null) {
    return true;
  }
  return StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none';
}

function FloatingGlassTabBarComponent({
  state,
  descriptors,
  navigation,
  tabs,
  labelMode = 'none',
  theme: themeProp,
  scale,
  isRtl = I18nManager.isRTL,
  collapsed: collapsedProp,
  collapsedScale = COLLAPSED_SCALE,
  iconSize = ICON_SIZE,
  floatGap = NAV_BAR_FLOAT_GAP,
  maxWidth,
  minTouchTarget = MIN_TOUCH_TARGET,
  pressedOpacity = PRESSED_OPACITY,
  labelMaxFontSizeMultiplier = LABEL_MAX_FONT_SIZE_MULTIPLIER,
  hideOnKeyboard = false,
  maxBadgeCount = 99,
  resetOnTabPress = true,
  pillSpring,
  collapseSpring,
  blurProps,
  renderBackground,
  renderBadge,
  style,
  barStyle,
  pillStyle,
  badgeStyle,
  labelStyle,
  activeLabelStyle,
}: FloatingGlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const defaultScale = useDefaultScale();
  const s = scale ?? defaultScale;
  const styles = useMemo(() => createStyles(s), [s]);
  const theme = useMemo(() => resolveTheme(themeProp), [themeProp]);
  const iconContext = useMemo(
    () => ({ background: theme.background }),
    [theme.background]
  );

  const store = useTabBarStore();
  const collapsed = collapsedProp ?? store.collapsed;

  const visibleRoutes = useMemo(
    () =>
      state.routes.filter(
        (route) =>
          tabs[route.name] !== undefined &&
          !isRouteHidden(descriptors[route.key]?.options)
      ),
    [state.routes, descriptors, tabs]
  );
  const focusedKey = state.routes[state.index]?.key;
  const count = visibleRoutes.length;
  const focusedSlot = visibleRoutes.findIndex((r) => r.key === focusedKey);

  // --- Sliding pill ---
  const [rowWidth, setRowWidth] = useState(0);
  const onRowLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  const iconPx = s(iconSize);
  // Center the badge on the icon's top-right corner.
  const badgeOffset = (s(PILL_WIDTH) - iconPx - s(BADGE_SIZE)) / 2;
  // The inline-label wrapper is exactly icon-wide.
  const activeBadgeOffset = -s(BADGE_SIZE) / 2;

  const tabWidth = count > 0 ? rowWidth / count : 0;
  const pillWidth =
    labelMode === 'active'
      ? Math.max(tabWidth - s(ACTIVE_PILL_INSET), 0)
      : s(PILL_WIDTH);
  const physicalSlot =
    focusedSlot < 0 ? -1 : isRtl ? count - 1 - focusedSlot : focusedSlot;
  const targetX = physicalSlot * tabWidth + (tabWidth - pillWidth) / 2;
  const showPill = rowWidth > 0 && physicalSlot >= 0;

  const translateX = useRef(new Animated.Value(0)).current;
  const positionedLayout = useRef<string | null>(null);
  const pillAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const pillBounciness =
    pillSpring?.bounciness ?? DEFAULT_PILL_SPRING.bounciness;
  const pillSpeed = pillSpring?.speed ?? DEFAULT_PILL_SPRING.speed;
  // Anything that moves every slot (not just the focused one) is a re-layout.
  const layoutKey = `${rowWidth}:${count}:${pillWidth}:${isRtl}`;

  useLayoutEffect(() => {
    if (!showPill) {
      return;
    }
    // Jump into place on the first layout and on every re-layout. Never start
    // a spring towards a target computed from a stale width.
    if (positionedLayout.current !== layoutKey) {
      positionedLayout.current = layoutKey;
      pillAnimation.current?.stop();
      pillAnimation.current = null;
      translateX.setValue(targetX);
      return;
    }
    pillAnimation.current = Animated.spring(translateX, {
      toValue: targetX,
      bounciness: pillBounciness,
      speed: pillSpeed,
      useNativeDriver: true,
    });
    pillAnimation.current.start();
  }, [showPill, layoutKey, targetX, translateX, pillBounciness, pillSpeed]);

  useEffect(() => () => pillAnimation.current?.stop(), []);

  // --- Collapse ---
  const scaleValue = useRef(
    new Animated.Value(collapsed ? collapsedScale : 1)
  ).current;
  const collapseBounciness =
    collapseSpring?.bounciness ?? DEFAULT_COLLAPSE_SPRING.bounciness;
  const collapseSpeed = collapseSpring?.speed ?? DEFAULT_COLLAPSE_SPRING.speed;

  useEffect(() => {
    const animation = Animated.spring(scaleValue, {
      toValue: collapsed ? collapsedScale : 1,
      bounciness: collapseBounciness,
      speed: collapseSpeed,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [
    collapsed,
    collapsedScale,
    collapseBounciness,
    collapseSpeed,
    scaleValue,
  ]);

  // --- Keyboard ---
  const keyboardVisible = useKeyboardVisible(hideOnKeyboard);
  const visibility = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.timing(visibility, {
      toValue: keyboardVisible ? 0 : 1,
      duration: 150,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [keyboardVisible, visibility]);

  // --- Navigation ---
  const { reset } = store;
  const onTabPress = useCallback(
    (route: Route, focused: boolean) => {
      if (resetOnTabPress) {
        reset();
      }
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, reset, resetOnTabPress]
  );

  const onTabLongPress = useCallback(
    (route: Route) => {
      navigation.emit({ type: 'tabLongPress', target: route.key });
    },
    [navigation]
  );

  return (
    <TabBarIconContext.Provider value={iconContext}>
      <Animated.View
        pointerEvents={keyboardVisible ? 'none' : 'box-none'}
        style={[
          styles.wrapper,
          // Set explicitly: direction doesn't reliably reach the bar through native screen containers.
          isRtl ? styles.rtl : styles.ltr,
          {
            paddingBottom: insets.bottom + s(floatGap),
            opacity: visibility,
            transform: [{ scale: scaleValue }],
          },
          style,
        ]}
      >
        <View
          style={[
            styles.container,
            {
              borderColor: theme.glassBorder,
              shadowColor: theme.shadowColor,
              shadowOpacity: theme.shadowOpacity,
              shadowRadius: s(theme.shadowRadius),
              shadowOffset: { width: 0, height: s(theme.shadowOffsetY) },
              elevation: theme.elevation,
              maxWidth: maxWidth === undefined ? undefined : s(maxWidth),
            },
            barStyle,
          ]}
        >
          {/* Separate clip so overflow:hidden doesn't cut off the container shadow. */}
          <View style={styles.clip} pointerEvents="none">
            {renderBackground ? (
              renderBackground()
            ) : (
              <>
                <BlurView
                  testID="floating-glass-tabbar-blur"
                  {...blurProps}
                  intensity={theme.blurIntensity}
                  tint={theme.blurTint}
                  style={styles.fill}
                />
                <View
                  testID="floating-glass-tabbar-tint"
                  style={[
                    styles.fill,
                    {
                      backgroundColor: theme.glassTint,
                      opacity: theme.glassOpacity,
                    },
                  ]}
                />
              </>
            )}
          </View>

          {showPill ? (
            <Animated.View
              testID="floating-glass-tabbar-pill"
              pointerEvents="none"
              style={[
                styles.pill,
                {
                  width: pillWidth,
                  backgroundColor: theme.primary,
                  transform: [{ translateX }],
                },
                pillStyle,
              ]}
            />
          ) : null}

          <View
            accessibilityRole="tablist"
            style={styles.row}
            onLayout={onRowLayout}
          >
            {visibleRoutes.map((route) => {
              const config = tabs[route.name];
              if (!config) {
                return null;
              }
              const options = descriptors[route.key]?.options;
              const badge = options?.tabBarBadge;
              return (
                <TabItem
                  key={route.key}
                  route={route}
                  config={config}
                  focused={route.key === focusedKey}
                  badgeCount={typeof badge === 'number' ? badge : 0}
                  accessibilityLabel={
                    options?.tabBarAccessibilityLabel ?? config.label
                  }
                  testID={options?.tabBarButtonTestID}
                  labelMode={labelMode}
                  pillWidth={pillWidth}
                  iconSize={iconPx}
                  badgeOffset={badgeOffset}
                  activeBadgeOffset={activeBadgeOffset}
                  maxBadgeCount={maxBadgeCount}
                  minHeight={minTouchTarget}
                  pressedOpacity={pressedOpacity}
                  fontMultiplier={labelMaxFontSizeMultiplier}
                  theme={theme}
                  styles={styles}
                  badgeStyle={badgeStyle}
                  labelStyle={labelStyle}
                  activeLabelStyle={activeLabelStyle}
                  renderBadge={renderBadge}
                  onPress={onTabPress}
                  onLongPress={onTabLongPress}
                />
              );
            })}
          </View>
        </View>
      </Animated.View>
    </TabBarIconContext.Provider>
  );
}

interface TabItemProps {
  route: Route;
  config: TabConfig;
  focused: boolean;
  badgeCount: number;
  accessibilityLabel: string;
  testID: string | undefined;
  labelMode: LabelMode;
  pillWidth: number;
  iconSize: number;
  badgeOffset: number;
  activeBadgeOffset: number;
  maxBadgeCount: number;
  minHeight: number;
  pressedOpacity: number;
  fontMultiplier: number;
  theme: ResolvedTheme;
  styles: FloatingGlassTabBarStyles;
  badgeStyle: StyleProp<ViewStyle>;
  labelStyle: StyleProp<TextStyle>;
  activeLabelStyle: StyleProp<TextStyle>;
  renderBadge: ((count: number) => ReactNode) | undefined;
  onPress: (route: Route, focused: boolean) => void;
  onLongPress: (route: Route) => void;
}

function TabItemComponent({
  route,
  config,
  focused,
  badgeCount,
  accessibilityLabel,
  testID,
  labelMode,
  pillWidth,
  iconSize,
  badgeOffset,
  activeBadgeOffset,
  maxBadgeCount,
  minHeight,
  pressedOpacity,
  fontMultiplier,
  theme,
  styles,
  badgeStyle,
  labelStyle,
  activeLabelStyle,
  renderBadge,
  onPress,
  onLongPress,
}: TabItemProps) {
  const Icon = config.icon;
  const inlineLabel = labelMode === 'active' && focused;
  const wrapperStyle = inlineLabel
    ? styles.activeIconWrapper
    : styles.iconWrapper;

  const badgeText =
    badgeCount > maxBadgeCount ? `${maxBadgeCount}+` : String(badgeCount);
  let badge: ReactNode = null;
  if (badgeCount > 0) {
    badge = (
      <View
        style={[
          styles.badgeSlot,
          { end: inlineLabel ? activeBadgeOffset : badgeOffset },
        ]}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {renderBadge ? (
          renderBadge(badgeCount)
        ) : (
          <View
            style={[
              styles.badge,
              { borderColor: theme.primary, backgroundColor: theme.badgeRing },
              badgeStyle,
            ]}
          >
            <View
              style={[styles.badgeInner, { backgroundColor: theme.primary }]}
            >
              <Text
                style={[styles.badgeText, { color: theme.badgeText }]}
                allowFontScaling={false}
              >
                {badgeText}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  const icon = (
    <View style={[wrapperStyle, inlineLabel && { width: iconSize }]}>
      <Icon
        color={focused ? theme.iconColor : theme.inactiveIconColor}
        size={iconSize}
        filled={focused}
      />
      {badge}
    </View>
  );

  let content: ReactNode = icon;
  if (inlineLabel) {
    content = (
      <View style={[styles.activeContent, { width: pillWidth }]}>
        {icon}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={fontMultiplier}
          style={[
            styles.labelActive,
            { color: theme.activeLabelColor },
            labelStyle,
            activeLabelStyle,
          ]}
        >
          {config.label}
        </Text>
      </View>
    );
  } else if (labelMode === 'below') {
    content = (
      <>
        {icon}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={fontMultiplier}
          style={[
            styles.labelBelow,
            { color: focused ? theme.activeLabelColor : theme.labelColor },
            focused && styles.labelBelowFocused,
            labelStyle,
            focused && activeLabelStyle,
          ]}
        >
          {config.label}
        </Text>
      </>
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={badgeCount > 0 ? { text: badgeText } : undefined}
      testID={testID}
      onPress={() => onPress(route, focused)}
      onLongPress={() => onLongPress(route)}
      style={({ pressed }) => [
        styles.tab,
        { minHeight },
        pressed && { opacity: pressedOpacity },
      ]}
    >
      {content}
    </Pressable>
  );
}

const TabItem = memo(TabItemComponent);

export const FloatingGlassTabBar = memo(FloatingGlassTabBarComponent);
FloatingGlassTabBar.displayName = 'FloatingGlassTabBar';
