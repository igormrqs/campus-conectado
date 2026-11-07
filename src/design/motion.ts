/**
 * Motion primitives for Campus Conectado.
 * Follows expo-animation guidelines and tokens.ts.
 */
import { Easing } from 'react-native-reanimated';
import { motion as motionTokens } from './tokens';

export const easings = {
  easeOut: Easing.bezier(0.23, 1, 0.32, 1),
  easeInOut: Easing.bezier(0.77, 0, 0.175, 1),
  sheet: Easing.bezier(0.32, 0.72, 0, 1),
} as const;

export const springs = {
  gentle: {
    duration: 350,
    dampingRatio: 0.9,
  },
  snappy: {
    duration: 250,
    dampingRatio: 0.75,
  },
  settle: {
    duration: 400,
    dampingRatio: 1,
  },
} as const;

export const motion = {
  ...motionTokens,
  easings,
  springs,
} as const;
