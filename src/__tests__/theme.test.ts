import { describe, expect, it } from '@jest/globals';
import { DARK_THEME, resolveTheme } from '../styles';

describe('resolveTheme', () => {
  it('defaults glass opacity to 1 and blur to 40', () => {
    const theme = resolveTheme();
    expect(theme.glassOpacity).toBe(1);
    expect(theme.blurIntensity).toBe(40);
  });

  it('clamps glass opacity to 0–1 and blur to 0–100', () => {
    expect(resolveTheme({ glassOpacity: 1.5 }).glassOpacity).toBe(1);
    expect(resolveTheme({ glassOpacity: -1 }).glassOpacity).toBe(0);
    expect(resolveTheme({ blurIntensity: 140 }).blurIntensity).toBe(100);
    expect(resolveTheme({ blurIntensity: -5 }).blurIntensity).toBe(0);
  });

  it('defaults the shadow and badge ring, and clamps shadow opacity', () => {
    const theme = resolveTheme();
    expect(theme.shadowOpacity).toBe(0.1);
    expect(theme.badgeRing).toBe('#FFFFFF');
    expect(theme.inactiveIconColor).toBe(theme.iconColor);
    expect(resolveTheme({ shadowOpacity: 3 }).shadowOpacity).toBe(1);
  });

  it('DARK_THEME resolves to a dark blur with light inactive icons', () => {
    const theme = resolveTheme(DARK_THEME);
    expect(theme.blurTint).toBe('dark');
    expect(theme.inactiveIconColor).toBe('#F5F5F5');
  });
});
