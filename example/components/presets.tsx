import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  AccountIcon,
  BookingsIcon,
  CartIcon,
  HomeIcon,
  type FloatingGlassTabBarProps,
  type LabelMode,
  type TabBarIconComponent,
  type TabBarIconProps,
} from 'react-native-floating-glass-tabbar';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Wraps an Ionicons pair (outline/filled) in the tab bar icon contract. */
function ion(outline: IoniconName, filled: IoniconName): TabBarIconComponent {
  return function IonTabIcon({ color, size, filled: f }: TabBarIconProps) {
    return <Ionicons name={f ? filled : outline} color={color} size={size} />;
  };
}

function mci(outline: MciName, filled: MciName): TabBarIconComponent {
  return function MciTabIcon({ color, size, filled: f }: TabBarIconProps) {
    return (
      <MaterialCommunityIcons
        name={f ? filled : outline}
        color={color}
        size={size}
      />
    );
  };
}

/** Text glyph icon: shows any emoji/character, dimmed when unfocused. */
function glyph(char: string): TabBarIconComponent {
  return function GlyphTabIcon({ size = 22, filled }: TabBarIconProps) {
    return (
      <Text style={[{ fontSize: size * 0.9 }, !filled && styles.dimmed]}>
        {char}
      </Text>
    );
  };
}

type BarProps = Omit<
  FloatingGlassTabBarProps,
  'state' | 'descriptors' | 'navigation' | 'insets' | 'labelMode' | 'isRtl'
>;

export interface Preset {
  name: string;
  description: string;
  labelMode: LabelMode;
  screenBackground: string;
  textColor: string;
  bar: BarProps;
}

export const PRESETS: Preset[] = [
  {
    name: 'classic',
    description: '4 tabs · built-in SVG icons · default theme',
    labelMode: 'none',
    screenBackground: '#FAFAFA',
    textColor: '#1A1A1A',
    bar: {
      tabs: {
        index: { icon: HomeIcon, label: 'Home' },
        bookings: { icon: BookingsIcon, label: 'Bookings' },
        cart: { icon: CartIcon, label: 'Cart' },
        account: { icon: AccountIcon, label: 'Account' },
      },
      theme: { primary: '#FFBD00', iconColor: '#1A1A1A' },
    },
  },
  {
    name: 'ionicons',
    description: '5 tabs · Ionicons · sky theme · labels below',
    labelMode: 'below',
    screenBackground: '#F0F9FF',
    textColor: '#0C4A6E',
    bar: {
      tabs: {
        index: { icon: ion('home-outline', 'home'), label: 'Home' },
        search: { icon: ion('search-outline', 'search'), label: 'Search' },
        bookings: {
          icon: ion('calendar-outline', 'calendar'),
          label: 'Bookings',
        },
        cart: { icon: ion('bag-outline', 'bag'), label: 'Cart' },
        account: { icon: ion('person-outline', 'person'), label: 'Me' },
      },
      theme: {
        primary: '#7DD3FC',
        iconColor: '#0C4A6E',
        badgeText: '#0C4A6E',
        labelColor: '#64748B',
        activeLabelColor: '#0C4A6E',
      },
    },
  },
  {
    name: 'dark',
    description: '4 tabs · dark glass · violet pill · active labels',
    labelMode: 'active',
    screenBackground: '#0B0B10',
    textColor: '#F4F4F5',
    bar: {
      tabs: {
        index: { icon: HomeIcon, label: 'Home' },
        bookings: { icon: BookingsIcon, label: 'Bookings' },
        cart: { icon: CartIcon, label: 'Cart' },
        account: { icon: AccountIcon, label: 'Account' },
      },
      theme: {
        primary: '#8B5CF6',
        iconColor: '#FFFFFF',
        background: '#8B5CF6',
        badgeText: '#FFFFFF',
        glassTint: 'rgba(24,24,32,0.78)',
        glassBorder: 'rgba(255,255,255,0.12)',
        blurTint: 'dark',
        blurIntensity: 60,
      },
    },
  },
  {
    name: 'six',
    description: '6 tabs · MaterialCommunityIcons · custom badge + pill',
    labelMode: 'none',
    screenBackground: '#ECFDF5',
    textColor: '#064E3B',
    bar: {
      tabs: {
        index: { icon: mci('home-outline', 'home'), label: 'Home' },
        search: { icon: mci('magnify', 'magnify'), label: 'Search' },
        bookings: {
          icon: mci('calendar-blank-outline', 'calendar-blank'),
          label: 'Bookings',
        },
        favorites: { icon: mci('heart-outline', 'heart'), label: 'Saved' },
        cart: { icon: mci('cart-outline', 'cart'), label: 'Cart' },
        account: {
          icon: mci('account-circle-outline', 'account-circle'),
          label: 'Account',
        },
      },
      iconSize: 21,
      theme: { primary: '#34D399', iconColor: '#064E3B' },
      pillStyle: { borderWidth: 1.5, borderColor: '#059669' },
      renderBadge: (count) => (
        <View style={styles.dotBadge}>
          <Text style={styles.dotBadgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      ),
    },
  },
  {
    name: 'emoji',
    description: '3 tabs · emoji icons · no scaling · big float gap',
    labelMode: 'active',
    screenBackground: '#FFF7ED',
    textColor: '#7C2D12',
    bar: {
      tabs: {
        index: { icon: glyph('🏠'), label: 'Home' },
        favorites: { icon: glyph('❤️'), label: 'Favorites' },
        account: { icon: glyph('😎'), label: 'Profile' },
      },
      scale: (size) => size,
      floatGap: 24,
      collapsedScale: 0.8,
      theme: {
        primary: '#FDBA74',
        iconColor: '#7C2D12',
        glassTint: 'rgba(255,247,237,0.9)',
      },
      style: { paddingHorizontal: 48 },
    },
  },
];

const styles = StyleSheet.create({
  dimmed: {
    opacity: 0.45,
  },
  dotBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
