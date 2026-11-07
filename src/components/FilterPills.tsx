import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing, layout } from '@/src/design/tokens';

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
  const filters: FilterItem[] = [
    { key: 'all', label: 'Todas', count: counts?.all },
    { key: 'pending', label: 'Pendentes', count: counts?.pending },
    { key: 'completed', label: 'Concluídas', count: counts?.completed },
  ];

  const handleSelect = (key: TaskFilterType) => {
    if (key === activeFilter) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // safe fallback
    }
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
            hitSlop={8}
            style={[styles.pill, isActive && styles.pillActive]}
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
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    minHeight: layout.touchTarget - 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.ink,
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
