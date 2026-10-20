import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  FloatingGlassTabBar,
  TabBarProvider,
} from 'react-native-floating-glass-tabbar';
import { DemoProvider, useDemo } from '../components/DemoContext';

function AppTabs() {
  const { preset, labelMode, cartCount, isRtl, glassOpacity, blurIntensity } =
    useDemo();

  return (
    <>
      <StatusBar style={preset.name === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{ headerShown: false }}
        // eslint-disable-next-line react/no-unstable-nested-components -- tabBar is a render prop
        tabBar={(props) => (
          <FloatingGlassTabBar
            {...props}
            {...preset.bar}
            theme={{ ...preset.bar.theme, glassOpacity, blurIntensity }}
            labelMode={labelMode}
            isRtl={isRtl}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="bookings" />
        <Tabs.Screen name="favorites" />
        <Tabs.Screen
          name="cart"
          options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
        />
        <Tabs.Screen name="account" />
        {/* Hidden route: never shown in the bar. */}
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TabBarProvider>
        <DemoProvider>
          <AppTabs />
        </DemoProvider>
      </TabBarProvider>
    </SafeAreaProvider>
  );
}
