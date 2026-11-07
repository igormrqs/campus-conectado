import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography, colors } from '@/src/design/tokens';

export type TypographyVariant = keyof typeof typography;

export interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function ThemedText({
  variant = 'body',
  color = colors.ink,
  align,
  style,
  children,
  ...props
}: ThemedTextProps) {
  const baseStyle = typography[variant];

  return (
    <Text
      style={[
        baseStyle,
        { color },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
