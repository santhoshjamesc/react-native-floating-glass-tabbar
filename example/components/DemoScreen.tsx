import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTabBarClearance,
  useTabBarScrollHandler,
} from 'react-native-floating-glass-tabbar';
import { useDemo } from './DemoContext';

const ROWS = Array.from({ length: 40 }, (_, i) => i + 1);

export function DemoScreen({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const demo = useDemo();
  const onScroll = useTabBarScrollHandler();
  const clearance = useTabBarClearance({ labelMode: demo.labelMode });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: demo.preset.screenBackground }]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: clearance },
      ]}
    >
      <Text style={[styles.title, { color: demo.preset.textColor }]}>
        {title}
      </Text>
      <Text style={[styles.hint, { color: demo.preset.textColor }]}>
        Preset “{demo.preset.name}”: {demo.preset.description}
      </Text>

      <View style={styles.controls}>
        <Button
          label={`Preset: ${demo.preset.name}`}
          onPress={demo.cyclePreset}
        />
        <Button
          label={`labelMode: ${demo.labelMode}`}
          onPress={demo.cycleLabelMode}
        />
        <Button
          label={`Add to cart (${demo.cartCount})`}
          onPress={demo.addToCart}
        />
        <Button label="Clear cart" onPress={demo.clearCart} />
        <Button
          label={`RTL: ${demo.isRtl ? 'on' : 'off'}`}
          onPress={demo.toggleRtl}
        />
      </View>

      <Stepper
        label={`Glass tint ${Math.round(demo.glassOpacity * 100)}%`}
        color={demo.preset.textColor}
        onDecrease={() => demo.adjustGlass(-0.1)}
        onIncrease={() => demo.adjustGlass(0.1)}
      />
      <Stepper
        label={`Blur ${demo.blurIntensity}`}
        color={demo.preset.textColor}
        onDecrease={() => demo.adjustBlur(-10)}
        onIncrease={() => demo.adjustBlur(10)}
      />

      <Text style={styles.hint}>
        Scroll down to collapse the bar, scroll up to expand it.
      </Text>

      {ROWS.map((row) => (
        <View
          key={row}
          style={[
            styles.card,
            { backgroundColor: CARD_COLORS[row % CARD_COLORS.length] },
          ]}
        >
          <Text style={styles.cardTitle}>
            {title} item {row}
          </Text>
          <Text style={styles.cardBody}>
            Colorful content so you can see the glass blur. The bar never covers
            the last card thanks to useTabBarClearance().
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Stepper({
  label,
  color,
  onDecrease,
  onIncrease,
}: {
  label: string;
  color: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Button label="−" onPress={onDecrease} />
      <Text style={[styles.stepperLabel, { color }]}>{label}</Text>
      <Button label="+" onPress={onIncrease} />
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  const { preset } = useDemo();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: preset.textColor },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, { color: preset.screenBackground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const CARD_COLORS = [
  '#F43F5E',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepperLabel: {
    minWidth: 130,
    textAlign: 'center',
    fontWeight: '600',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hint: {
    color: '#666666',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBody: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
  },
});
