# react-native-floating-glass-tabbar

JS-only React Native library (builder-bob, Yarn 4 workspaces) and an expo-router example app in `example/`.

## Rule: everything must be configurable
Any app-specific value (colors, sizes, springs, icons, labels, background, badge) is exposed as a prop or theme key with a default. Don't hardcode new values without a prop.

## Layout
- `src/FloatingGlassTabBar.tsx`: the component (React.memo) and the prop types
- `src/styles.ts`: constants, theme defaults, and `createStyles(scale)`
- `src/icons.tsx`: default SVG icons and `TabBarIconContext` (gives icons the theme background)
- `src/store.tsx`: collapse store built on `useSyncExternalStore`, plus `TabBarProvider`
- `src/hooks.ts`: `useTabBarScrollHandler`, `useTabBarClearance`, `useDefaultScale`
- `src/index.ts`: public exports

## Gotchas
- expo-router ≥ 55 ships its own copy of React Navigation, so its `BottomTabBarProps` is *not* assignable to `@react-navigation/bottom-tabs` types. The bar uses structural types (`TabBarNavigationProps`). Keep them structural, and keep the React Navigation compile check in `src/__tests__/FloatingGlassTabBar.test.tsx` and `example/app/_layout.tsx` type-checking.
- expo-router hides `href: null` routes with `tabBarItemStyle: { display: 'none' }`.
- Core `Animated` only (no reanimated), and no runtime dependencies.

## Commands
```sh
yarn typecheck && yarn lint && yarn test && yarn prepare
(cd example && npx tsc --noEmit -p .)
yarn example ios | android
```

The example app accepts deep-link query params (`preset`, `labelMode`, `cart`, `rtl`, `collapsed`) to drive state, e.g. `xcrun simctl openurl booted "exp://<host>:8081/--/<route>?preset=dark&labelMode=active"`.
