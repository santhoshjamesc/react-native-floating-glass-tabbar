import { createContext, useContext, type ComponentType } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { DEFAULT_THEME, ICON_SIZE } from './styles';

export interface TabBarIconProps {
  color: string;
  size?: number;
  filled?: boolean;
}

export type TabBarIconComponent = ComponentType<TabBarIconProps>;

export interface TabBarIconContextValue {
  /** Color for detail strokes drawn on top of a filled shape. */
  background: string;
}

/** Provided by the tab bar so the built-in icons can read the theme background. */
export const TabBarIconContext = createContext<TabBarIconContextValue>({
  background: DEFAULT_THEME.background,
});

const STROKE_WIDTH = 1.65;
const HOME_STROKE_WIDTH = 2.02;

function useIconColors(color: string, filled: boolean | undefined) {
  const { background } = useContext(TabBarIconContext);
  return {
    fill: filled ? color : 'none',
    detail: filled ? background : color,
  };
}

export function HomeIcon({ color, size = ICON_SIZE, filled }: TabBarIconProps) {
  const { fill, detail } = useIconColors(color, filled);
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={HOME_STROKE_WIDTH}
    >
      <Path
        d="M3.5 9.4 11 3.25l7.5 6.15v8.1a1.75 1.75 0 0 1-1.75 1.75H5.25A1.75 1.75 0 0 1 3.5 17.5V9.4Z"
        fill={fill}
        stroke={color}
      />
      <Path d="M8.75 18.9v-3.65a2.25 2.25 0 0 1 4.5 0v3.65" stroke={detail} />
    </Svg>
  );
}

export function BookingsIcon({
  color,
  size = ICON_SIZE,
  filled,
}: TabBarIconProps) {
  const { fill, detail } = useIconColors(color, filled);
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
    >
      <Rect
        x={3}
        y={4.5}
        width={16}
        height={14.5}
        rx={3}
        fill={fill}
        stroke={color}
      />
      <Path d="M7.5 2.75v3.5M14.5 2.75v3.5" stroke={color} />
      <Path
        d="M3.9 9.25h14.2M7.5 13.25h.01M11 13.25h.01M14.5 13.25h.01"
        stroke={detail}
      />
    </Svg>
  );
}

export function CartIcon({ color, size = ICON_SIZE, filled }: TabBarIconProps) {
  const { fill, detail } = useIconColors(color, filled);
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
    >
      <Path
        d="M4.75 7.25h12.5l-.9 10.6a1.9 1.9 0 0 1-1.9 1.75H7.55a1.9 1.9 0 0 1-1.9-1.75l-.9-10.6Z"
        fill={fill}
        stroke={color}
      />
      <Path d="M8 7.25V6a3 3 0 0 1 6 0v1.25" stroke={color} />
      <Path d="M8 10.5a3 3 0 0 0 6 0" stroke={detail} />
    </Svg>
  );
}

export function AccountIcon({
  color,
  size = ICON_SIZE,
  filled,
}: TabBarIconProps) {
  const { fill } = useIconColors(color, filled);
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
    >
      <Circle cx={11} cy={7} r={3.5} fill={fill} stroke={color} />
      <Path
        d="M4.25 18.75c0-3.45 3.02-6 6.75-6s6.75 2.55 6.75 6a.75.75 0 0 1-.75.75H5a.75.75 0 0 1-.75-.75Z"
        fill={fill}
        stroke={color}
      />
    </Svg>
  );
}
