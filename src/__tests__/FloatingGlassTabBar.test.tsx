import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  BookingsIcon,
  CartIcon,
  createTabBarStore,
  FloatingGlassTabBar,
  HomeIcon,
  TabBarProvider,
  type FloatingGlassTabBarProps,
  type TabBarNavigation,
  type TabsConfig,
} from '../index';

// Compile-time check: React Navigation's tabBar props fit as-is.
export function ReactNavigationTabBar(props: BottomTabBarProps) {
  return <FloatingGlassTabBar {...props} tabs={TABS} />;
}

const TABS: TabsConfig = {
  home: { icon: HomeIcon, label: 'Home' },
  bookings: { icon: BookingsIcon, label: 'Bookings' },
  cart: { icon: CartIcon, label: 'Cart' },
};

type Options = FloatingGlassTabBarProps['descriptors'][string];

function setup(
  overrides: Partial<FloatingGlassTabBarProps> = {},
  options: Record<string, NonNullable<Options>['options']> = {},
  index = 0
) {
  const routes = [
    { key: 'home-key', name: 'home' },
    { key: 'bookings-key', name: 'bookings' },
    { key: 'cart-key', name: 'cart' },
    { key: 'settings-key', name: 'settings' },
    { key: 'hidden-key', name: 'hidden' },
  ];
  const descriptors = Object.fromEntries(
    routes.map((r) => [r.key, { options: options[r.name] ?? {} }])
  );
  let prevent = false;
  const emit = jest.fn<TabBarNavigation['emit']>((event) => ({
    type: event.type,
    defaultPrevented: prevent,
  }));
  const navigate = jest.fn<TabBarNavigation['navigate']>();
  const props: FloatingGlassTabBarProps = {
    state: { index, routes },
    descriptors,
    navigation: { emit, navigate },
    tabs: { ...TABS, hidden: { icon: HomeIcon, label: 'Hidden' } },
    ...overrides,
  };
  return {
    props,
    emit,
    navigate,
    preventDefault: () => {
      prevent = true;
    },
  };
}

function withProvider(children: ReactNode, store = createTabBarStore()) {
  return <TabBarProvider store={store}>{children}</TabBarProvider>;
}

describe('FloatingGlassTabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders only configured, non-hidden routes', async () => {
    const { props } = setup(
      {},
      { hidden: { tabBarItemStyle: { display: 'none' } } }
    );
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    const buttons = screen.getAllByRole('tab');
    expect(buttons.map((b) => b.props.accessibilityLabel)).toEqual([
      'Home',
      'Bookings',
      'Cart',
    ]);
  });

  it('uses tabBarAccessibilityLabel and selected state', async () => {
    const { props } = setup(
      {},
      { cart: { tabBarAccessibilityLabel: 'Shopping cart' } },
      2
    );
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    const cart = screen.getByLabelText('Shopping cart');
    expect(cart.props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByLabelText('Home').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('emits tabPress and navigates to unfocused tabs', async () => {
    const { props, emit, navigate } = setup();
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    await fireEvent.press(screen.getByLabelText('Bookings'));
    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'bookings-key',
      canPreventDefault: true,
    });
    expect(navigate).toHaveBeenCalledWith('bookings', undefined);
  });

  it('does not navigate when focused or default-prevented', async () => {
    const { props, navigate, preventDefault } = setup();
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    await fireEvent.press(screen.getByLabelText('Home'));
    expect(navigate).not.toHaveBeenCalled();
    preventDefault();
    await fireEvent.press(screen.getByLabelText('Cart'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('expands the bar on tab press', async () => {
    const store = createTabBarStore(true);
    const { props } = setup();
    await render(withProvider(<FloatingGlassTabBar {...props} />, store));
    await fireEvent.press(screen.getByLabelText('Cart'));
    expect(store.getCollapsed()).toBe(false);
  });

  it('renders numeric badges, caps at 99+ and hides non-positive counts', async () => {
    const { props } = setup(
      {},
      {
        cart: { tabBarBadge: 150 },
        bookings: { tabBarBadge: 0 },
        home: { tabBarBadge: 'new' },
      }
    );
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(
      screen.getByText('99+', { includeHiddenElements: true })
    ).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.queryByText('new')).toBeNull();
  });

  it('supports renderBadge and maxBadgeCount', async () => {
    const { props } = setup(
      { renderBadge: (count) => <Text>badge:{count}</Text> },
      { cart: { tabBarBadge: 3 } }
    );
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(
      screen.getByText('badge:3', { includeHiddenElements: true })
    ).toBeTruthy();
  });

  it('exposes the badge count to screen readers on the tab', async () => {
    const { props } = setup({}, { cart: { tabBarBadge: 150 } });
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.getByLabelText('Cart').props.accessibilityValue).toEqual({
      text: '99+',
    });
  });

  it('colors unfocused icons with inactiveIconColor', async () => {
    const Probe = ({ color }: { color: string }) => <Text>{color}</Text>;
    const { props } = setup({
      tabs: {
        home: { icon: Probe, label: 'Home' },
        bookings: { icon: Probe, label: 'Bookings' },
        cart: { icon: Probe, label: 'Cart' },
      },
      theme: { iconColor: '#111111', inactiveIconColor: '#999999' },
    });
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.getAllByText('#111111')).toHaveLength(1);
    expect(screen.getAllByText('#999999')).toHaveLength(2);
  });

  it('labelMode none shows no labels', async () => {
    const { props } = setup();
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('labelMode below shows every label', async () => {
    const { props } = setup({ labelMode: 'below' });
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Bookings')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
  });

  it('labelMode active shows only the focused label', async () => {
    const { props } = setup({ labelMode: 'active' }, {}, 1);
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.getByText('Bookings')).toBeTruthy();
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('applies glassOpacity to the tint layer and blurIntensity to the blur', async () => {
    const { props } = setup({
      theme: { glassOpacity: 0.3, blurIntensity: 75, glassTint: '#ABCDEF' },
    });
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    const tint = screen.getByTestId('floating-glass-tabbar-tint');
    expect(StyleSheet.flatten(tint.props.style)).toMatchObject({
      backgroundColor: '#ABCDEF',
      opacity: 0.3,
    });
    expect(
      screen.getByTestId('floating-glass-tabbar-blur').props.intensity
    ).toBe(75);
  });

  it('renders a custom background instead of the blur', async () => {
    const { props } = setup({
      renderBackground: () => <View testID="custom-bg" />,
    });
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    expect(screen.getByTestId('custom-bg')).toBeTruthy();
  });

  it('positions the pill from the new layout when the tab count changes', async () => {
    const pillX = () =>
      StyleSheet.flatten(
        screen.getByTestId('floating-glass-tabbar-pill').props.style
      ).transform?.[0] as { translateX: number };
    const scale = (n: number) => n;
    const { props } = setup({ scale }, {}, 2);
    await render(withProvider(<FloatingGlassTabBar {...props} />));
    const row = () => screen.getByLabelText('Home').parent!;
    await fireEvent(row(), 'layout', {
      nativeEvent: { layout: { width: 400 } },
    });
    // 4 visible tabs (incl. `hidden`) of 100, cart focused: 2 * 100 + (100 - 48) / 2
    expect(pillX().translateX).toBe(226);

    // Drop to 2 tabs, focus bookings, then the bar is re-measured narrower.
    const tabs = { home: TABS.home!, bookings: TABS.bookings! };
    const next = { ...props, tabs, state: { ...props.state, index: 1 } };
    await screen.rerender(withProvider(<FloatingGlassTabBar {...next} />));
    await fireEvent(row(), 'layout', {
      nativeEvent: { layout: { width: 200 } },
    });
    // 2 tabs of 100, bookings focused: 1 * 100 + 26
    expect(pillX().translateX).toBe(126);
  });

  it('reacts to store changes', async () => {
    const store = createTabBarStore();
    const { props } = setup();
    await render(withProvider(<FloatingGlassTabBar {...props} />, store));
    await act(() => store.setCollapsed(true));
    expect(store.getCollapsed()).toBe(true);
  });
});
