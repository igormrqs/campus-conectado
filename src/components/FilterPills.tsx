import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing, layout } from '@/src/design/tokens';
import { triggerHaptic } from '@/src/design/platform-utils';

export type TaskFilterType = 'all' | 'pending' | 'completed';

export interface FilterItem {
  key: TaskFilterType;
  label: string;
  count?: number;
}

export interface FilterPillsProps {
  activeFilter: TaskFilterType;
  onSelect: (filter: TaskFilterType) => void;
  counts?: {
    all: number;
    pending: number;
    completed: number;
  };
}

export function FilterPills({ activeFilter, onSelect, counts }: FilterPillsProps) {
  const reducedMotion = useReducedMotion();

  const filters: FilterItem[] = [
    { key: 'all', label: 'Todas', count: counts?.all },
    { key: 'pending', label: 'Pendentes', count: counts?.pending },
    { key: 'completed', label: 'Concluídas', count: counts?.completed },
  ];

  const handleSelect = async (key: TaskFilterType) => {
    if (key === activeFilter) return;
    await triggerHaptic('selection');
    onSelect(key);
  };

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => handleSelect(filter.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${filter.label}${filter.count !== undefined ? `, ${filter.count} itens` : ''}`}
            hitSlop={6}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && !isActive && styles.pillPressed,
            ]}
          >
            <ThemedText
              variant="label"
              color={isActive ? colors.white : colors.ink}
              style={[styles.pillText, isActive && styles.pillTextActive]}
            >
              {filter.label}
              {filter.count !== undefined && (
                <ThemedText
                  variant="caption"
                  color={isActive ? colors.lime : colors.muted}
                  style={styles.pillCount}
                >
                  {' '}({filter.count})
                </ThemedText>
              )}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.softPaper,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pill: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
  },
  pillActive: {
    backgroundColor: colors.ink,
  },
  pillPressed: {
    backgroundColor: 'rgba(23, 26, 33, 0.08)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    fontWeight: '600',
  },
  pillCount: {
    fontSize: 12,
  },
});
