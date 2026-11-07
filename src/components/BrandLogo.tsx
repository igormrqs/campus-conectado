import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { colors, fonts, spacing } from '@/src/design/tokens';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BrandLogo({
  size = 'sm',
  showWordmark = true,
  style,
}: BrandLogoProps) {
  const getDimensions = () => {
    switch (size) {
      case 'lg':
        return {
          width: 48,
          height: 56,
          radius: 8,
          spineWidth: 12,
          ribbonWidth: 9,
          ribbonHeight: 16,
          dotSize: 9,
          dotRing: 15,
          textVariant: 'headline' as const,
          textSize: 18,
          letterSpacing: 2,
        };
      case 'md':
        return {
          width: 32,
          height: 38,
          radius: 6,
          spineWidth: 8,
          ribbonWidth: 6,
          ribbonHeight: 11,
          dotSize: 6,
          dotRing: 10,
          textVariant: 'label' as const,
          textSize: 14,
          letterSpacing: 1.6,
        };
      case 'sm':
      default:
        return {
          width: 20,
          height: 24,
          radius: 4,
          spineWidth: 5,
          ribbonWidth: 4,
          ribbonHeight: 7,
          dotSize: 4,
          dotRing: 7,
          textVariant: 'caption' as const,
          textSize: 12,
          letterSpacing: 1.4,
        };
    }
  };

  const dim = getDimensions();

  return (
    <View style={[styles.container, style]} accessibilityRole="image" accessibilityLabel="Logo do Campus Conectado">
      {/* Stylized Editorial Notebook Emblem */}
      <View
        style={[
          styles.emblem,
          {
            width: dim.width,
            height: dim.height,
            borderRadius: dim.radius,
          },
        ]}
      >
        {/* Electric Blue Spine */}
        <View style={[styles.spine, { width: dim.spineWidth }]} />

        {/* Notebook Cover Area */}
        <View style={styles.cover}>
          {/* Lime Bookmark Ribbon */}
          <View
            style={[
              styles.ribbon,
              {
                width: dim.ribbonWidth,
                height: dim.ribbonHeight,
              },
            ]}
          />

          {/* Connected Orbital Node */}
          <View
            style={[
              styles.orbitalRing,
              {
                width: dim.dotRing,
                height: dim.dotRing,
                borderRadius: dim.dotRing / 2,
              },
            ]}
          >
            <View
              style={[
                styles.orbitalDot,
                {
                  width: dim.dotSize,
                  height: dim.dotSize,
                  borderRadius: dim.dotSize / 2,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Brand Wordmark */}
      {showWordmark && (
        <ThemedText
          variant={dim.textVariant}
          color={colors.ink}
          style={[
            styles.wordmark,
            {
              fontSize: dim.textSize,
              letterSpacing: dim.letterSpacing,
            },
          ]}
        >
          CAMPUS CONECTADO
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 4,
  },
  emblem: {
    backgroundColor: colors.ink,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    borderCurve: 'continuous',
  },
  spine: {
    backgroundColor: colors.blue,
    height: '100%',
  },
  cover: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 3,
    backgroundColor: colors.lime,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  orbitalRing: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    borderWidth: 1,
    borderColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitalDot: {
    backgroundColor: colors.blue,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontWeight: '700',
  },
});
