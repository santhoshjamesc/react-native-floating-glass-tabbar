# react-native-floating-glass-tabbar

[![npm](https://img.shields.io/npm/v/react-native-floating-glass-tabbar)](https://www.npmjs.com/package/react-native-floating-glass-tabbar)
[![CI](https://github.com/santhoshjamesc/react-native-floating-glass-tabbar/actions/workflows/ci.yml/badge.svg)](https://github.com/santhoshjamesc/react-native-floating-glass-tabbar/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-floating-glass-tabbar)](./LICENSE)
![platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-lightgrey)

A floating, frosted-glass pill tab bar for React Native (iOS and Android). Drop it into `@react-navigation/bottom-tabs` or expo-router's `<Tabs tabBar={...}>`.

- Floating pill with blur (`expo-blur`), a tint overlay and a soft shadow
- A sliding active indicator, animated with a native-driver spring
- Three label modes: `none`, `below` and `active`
- Collapses while you scroll, with a built-in store (no zustand or reanimated needed)
- Numeric badges, RTL support and accessibility
- Fully configurable: theme, sizes, springs, icons, background, badge and styles

## Installation

```sh
npm install react-native-floating-glass-tabbar
# or
yarn add react-native-floating-glass-tabbar
```

### Peer dependencies

| Package                          | Notes                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `react`, `react-native`          |                                                                                              |
| `react-native-safe-area-context` | Bottom inset                                                                                 |
| `react-native-svg`               | Built-in icons                                                                               |
| `expo-blur`                      | Glass effect (works in bare RN through `expo-modules-core`)                                  |
| `@react-navigation/bottom-tabs`  | Optional. Only its types are used, and expo-router ≥ 55 ships its own copy of the navigator. |

```sh
npx expo install expo-blur react-native-svg react-native-safe-area-context
```

There are no runtime dependencies. Animations use the core `Animated` API, so no Reanimated setup is needed.

## Usage

### expo-router

```tsx
// app/_layout.tsx
import { Tabs } from 'expo-router';
import {
  AccountIcon,
  BookingsIcon,
  CartIcon,
  FloatingGlassTabBar,
  HomeIcon,
  TabBarProvider,
} from 'react-native-floating-glass-tabbar';

export default function Layout() {
  return (
    <TabBarProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <FloatingGlassTabBar
            {...props}
            tabs={{
              index: { icon: HomeIcon, label: 'Home' },
              bookings: { icon: BookingsIcon, label: 'Bookings' },
              cart: { icon: CartIcon, label: 'Cart' },
              account: { icon: AccountIcon, label: 'Account' },
            }}
            labelMode="active"
            theme={{
              primary: '#FFBD00',
              iconColor: '#1A1A1A',
              background: '#FAFAFA',
            }}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="bookings" />
        <Tabs.Screen name="cart" options={{ tabBarBadge: 3 }} />
        <Tabs.Screen name="account" />
        {/* Never shown in the bar */}
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </TabBarProvider>
  );
}
```

### React Navigation

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  FloatingGlassTabBar,
  HomeIcon,
  AccountIcon,
  type TabsConfig,
} from 'react-native-floating-glass-tabbar';

const TABS: TabsConfig = {
  Home: { icon: HomeIcon, label: 'Home' },
  Account: { icon: AccountIcon, label: 'Account' },
};

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingGlassTabBar {...props} tabs={TABS} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
```

The `tabs` keys are **route names**. Only routes listed in `tabs` are rendered, and routes hidden with `href: null` (expo-router) or `tabBarItemStyle: { display: 'none' }` are always skipped.

## Props

| Prop                         | Type                                             | Default                                    | Description                                                                                    |
| ---------------------------- | ------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `tabs`                       | `Record<routeName, { icon, label }>`             | **required**                               | Which routes to show, with their icon and label.                                               |
| `labelMode`                  | `'none' \| 'below' \| 'active'`                  | `'none'`                                   | See [Label modes](#label-modes).                                                               |
| `theme`                      | `FloatingGlassTabBarTheme`                       | see below                                  | Colors and blur settings.                                                                      |
| `scale`                      | `(size: number) => number`                       | `(s) => (max(screenW, screenH) / 844) * s` | Every size goes through this. Pass `(s) => s` to turn scaling off.                             |
| `isRtl`                      | `boolean`                                        | `I18nManager.isRTL`                        | Set explicitly on the bar, because direction doesn't reliably cross native screen containers.  |
| `collapsed`                  | `boolean`                                        | store value                                | Controlled collapse state. Overrides the store.                                                |
| `collapsedScale`             | `number`                                         | `0.88`                                     | Wrapper scale when collapsed.                                                                  |
| `iconSize`                   | `number`                                         | `22`                                       | Icon size (scaled).                                                                            |
| `floatGap`                   | `number`                                         | `12`                                       | Gap above the safe-area bottom inset (scaled).                                                 |
| `maxWidth`                   | `number`                                         | full width                                 | Caps the bar width (scaled) and centers it, for tablets and landscape.                         |
| `minTouchTarget`             | `number`                                         | `44`                                       | Minimum tab height in points (not scaled).                                                     |
| `pressedOpacity`             | `number`                                         | `0.7`                                      | Tab opacity while pressed. `1` disables the feedback.                                          |
| `labelMaxFontSizeMultiplier` | `number`                                         | `1.2`                                      | Caps system font scaling on labels.                                                            |
| `hideOnKeyboard`             | `boolean`                                        | `false`                                    | Fade the bar out while the keyboard is open.                                                   |
| `maxBadgeCount`              | `number`                                         | `99`                                       | Larger counts render as `99+`.                                                                 |
| `resetOnTabPress`            | `boolean`                                        | `true`                                     | Expand the bar when a tab is pressed.                                                          |
| `pillSpring`                 | `{ bounciness?, speed? }`                        | `{ bounciness: 6, speed: 16 }`             | Spring for the sliding pill.                                                                   |
| `collapseSpring`             | `{ bounciness?, speed? }`                        | `{ bounciness: 4, speed: 14 }`             | Spring for collapse and expand.                                                                |
| `blurProps`                  | `BlurViewProps` (without intensity, tint, style) | –                                          | Passed to expo-blur's `BlurView`, e.g. `blurMethod` and `blurTarget` for real blur on Android. |
| `renderBackground`           | `() => ReactNode`                                | –                                          | Replaces the blur and tint layers. The clip and border stay.                                   |
| `renderBadge`                | `(count: number) => ReactNode`                   | –                                          | Custom badge. Called only when the count is > 0.                                               |
| `style`                      | `StyleProp<ViewStyle>`                           | –                                          | Outer, absolutely positioned wrapper.                                                          |
| `barStyle`                   | `StyleProp<ViewStyle>`                           | –                                          | The glass pill container.                                                                      |
| `pillStyle`                  | `StyleProp<ViewStyle>`                           | –                                          | Active indicator.                                                                              |
| `badgeStyle`                 | `StyleProp<ViewStyle>`                           | –                                          | Badge outer circle.                                                                            |
| `labelStyle`                 | `StyleProp<TextStyle>`                           | –                                          | All labels.                                                                                    |
| `activeLabelStyle`           | `StyleProp<TextStyle>`                           | –                                          | The focused label.                                                                             |

It also receives the standard `tabBar` props (`state`, `descriptors`, `navigation`, `insets`).

Per-route options it reads:

- `tabBarBadge`: shown as a badge when it's a number
- `tabBarAccessibilityLabel`: falls back to `tabs[name].label`
- `tabBarButtonTestID`
- `tabBarItemStyle: { display: 'none' }` or `href: null`: hides the tab

### Theme

| Key                 | Default                  |
| ------------------- | ------------------------ |
| `primary`           | `#FFBD00`                |
| `iconColor`         | `#1A1A1A`                |
| `inactiveIconColor` | `iconColor`              |
| `background`        | `#FAFAFA`                |
| `badgeText`         | `#1A1A1A`                |
| `badgeRing`         | `#FFFFFF`                |
| `shadowColor`       | `#000`                   |
| `shadowOpacity`     | `0.1`                    |
| `shadowRadius`      | `12`                     |
| `shadowOffsetY`     | `4`                      |
| `elevation`         | `10`                     |
| `glassTint`         | `rgba(255,255,255,0.85)` |
| `glassOpacity`      | `1`                      |
| `glassBorder`       | `rgba(255,255,255,0.6)`  |
| `blurIntensity`     | `40`                     |
| `blurTint`          | `'light'`                |
| `labelColor`        | `iconColor`              |
| `activeLabelColor`  | `iconColor`              |

`background` is used for the detail strokes drawn inside filled icons, so they stay visible against the fill.

A ready-made dark preset is exported as `DARK_THEME` (`theme={DARK_THEME}`). In `labelMode="below"` also set `activeLabelColor` to a light color, since the focused label sits on the glass.

### Glass transparency and blur strength

Two knobs control the glass:

- **`glassOpacity`** (0–1) sets how opaque the `glassTint` layer is. Lower values make the glass more see-through, and `0` shows the pure blur. Change `glassTint` itself to recolor the glass.
- **`blurIntensity`** (0–100) sets how strong the blur behind the tint is.

Out-of-range values are clamped.

```tsx
// Crisp, almost solid (default)
theme={{ glassOpacity: 1, blurIntensity: 40 }}
// Frosted
theme={{ glassOpacity: 0.5, blurIntensity: 70 }}
// Clear glass, light blur
theme={{ glassOpacity: 0, blurIntensity: 20 }}
// Dark smoked glass
theme={{ glassTint: 'rgba(24,24,32,0.78)', blurTint: 'dark', glassOpacity: 0.3, blurIntensity: 90 }}
```

The example app has − / + steppers for both, and accepts `glass=` and `blur=` in its deep links.

## Label modes

| Mode     | Behaviour                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `none`   | Icons only.                                                                                                                                                                                                                                                  |
| `below`  | Every tab shows its label under the icon (11px, weight 500; the focused label is weight 700 in `activeLabelColor`). The pill stays 48×34 behind the icon. Add `LABEL_EXTRA_HEIGHT` to your clearance; `useTabBarClearance({ labelMode })` does this for you. |
| `active` | Only the focused tab shows its label, next to the icon inside a wider pill (`tabWidth - 8`). The label is truncated with an ellipsis if it doesn't fit. In RTL the label follows the icon on the leading side.                                               |

## Icons

Four default icons ship as named exports: `HomeIcon`, `BookingsIcon` (calendar), `CartIcon` (shopping bag) and `AccountIcon` (person). The focused tab renders the `filled` variant.

Use any component that matches this contract:

```ts
type TabBarIconProps = { color: string; size?: number; filled?: boolean };
```

```tsx
import Ionicons from '@expo/vector-icons/Ionicons';

const SearchIcon = ({ color, size, filled }: TabBarIconProps) => (
  <Ionicons
    name={filled ? 'search' : 'search-outline'}
    color={color}
    size={size}
  />
);
```

## Collapse on scroll

The bar shrinks to `collapsedScale` when the user scrolls down and comes back when they scroll up, reach the top, or press a tab.

```tsx
import {
  useTabBarClearance,
  useTabBarScrollHandler,
} from 'react-native-floating-glass-tabbar';

function FeedScreen() {
  const onScroll = useTabBarScrollHandler(); // { threshold?: 8, onScroll? }
  const paddingBottom = useTabBarClearance({ labelMode: 'active' });

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom }}
    />
  );
}
```

How the handler decides:

- `y ≤ 0`: expand
- delta `> threshold`: collapse
- delta `< -threshold`: expand

It writes to the store only when the value actually changes.

The store:

- `<TabBarProvider>` scopes the state to a subtree. Without a provider, a shared global store is used.
- `useTabBarStore()` returns `{ collapsed, setCollapsed, reset }`.
- `createTabBarStore()` and `<TabBarProvider store={...}>` let you own the store yourself.
- The controlled `collapsed` prop on the bar overrides the store.

## Content clearance

`useTabBarClearance(options?)` returns `safeAreaBottom + scale(96)`, plus `scale(14)` when `labelMode` is `'below'`. Use it as bottom padding so the floating bar never covers content. Options:

- `labelMode`
- `scale`: pass the same function you give the bar
- `clearance`: overrides the base of 96

Exported constants: `NAV_BAR_CLEARANCE` (96), `NAV_BAR_FLOAT_GAP` (12), `PILL_WIDTH` (48), `PILL_HEIGHT` (34), `LABEL_EXTRA_HEIGHT` (14).

## Android blur

Recent versions of `expo-blur` only blur on Android when you opt in. Wrap the content behind the bar in a `BlurTargetView` and forward it:

```tsx
<FloatingGlassTabBar
  {...props}
  tabs={TABS}
  blurProps={{ blurMethod: 'dimezisBlurView', blurTarget }}
/>
```

Without this, Android shows the translucent tint only, which already looks close to the iOS glass.

## Example app

```sh
yarn
yarn example ios     # or: yarn example android
```

The example (expo-router) has a long scroll that collapses the bar, a badge counter, and buttons that cycle the preset, `labelMode` and RTL. The presets in `example/components/presets.tsx` show different configurations:

| Preset     | Shows                                                                                   |
| ---------- | --------------------------------------------------------------------------------------- |
| `classic`  | 4 tabs, built-in SVG icons, default theme                                               |
| `ionicons` | 5 tabs, `@expo/vector-icons` Ionicons, sky theme, labels below                          |
| `dark`     | 4 tabs, dark glass (`blurTint: 'dark'`), violet pill, active labels                     |
| `six`      | 6 tabs, MaterialCommunityIcons, bordered `pillStyle`, custom `renderBadge`              |
| `emoji`    | 3 tabs, emoji icons, no scaling (`scale={(s) => s}`), bigger `floatGap`, custom `style` |

You can also jump straight to a state with a deep link, e.g.:

```sh
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/cart?preset=dark&labelMode=active&cart=120&rtl=1&collapsed=1"
```

## License

MIT
