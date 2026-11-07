import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  useTasks,
  Task,
  selectFilteredTasks,
  getTaskDisciplines,
  useTaskToday,
  TaskFilter,
} from '@/src/features/tasks';
import { colors, spacing, radius, layout } from '@/src/design/tokens';
import { showAlert } from '@/src/design/platform-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { TaskCard } from '@/src/components/TaskCard';
import { FilterPills } from '@/src/components/FilterPills';
import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/Header';

export default function ActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isHydrated, error, retryHydration, toggleTask } = useTasks();

  const today = useTaskToday();
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  // Disciplines extracted via strict pt-BR alphabetical deduplicated helper
  const disciplines = useMemo(() => getTaskDisciplines(tasks), [tasks]);

  // Discipline subset for consistent counters prior to status filtering
  const disciplineSubset = useMemo(() => {
    return selectFilteredTasks(tasks, 'all', selectedDiscipline, today);
  }, [tasks, selectedDiscipline, today]);

  const counts = useMemo(() => {
    const all = disciplineSubset.length;
    const completed = disciplineSubset.filter((t) => t.completed).length;
    const pending = all - completed;
    return { all, pending, completed };
  }, [disciplineSubset]);

  // Filtered and ordered tasks via frozen shared selector
  const filteredTasks = useMemo(() => {
    return selectFilteredTasks(tasks, activeFilter, selectedDiscipline, today);
  }, [tasks, activeFilter, selectedDiscipline, today]);

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/task-form',
      params: { id: task.id },
    });
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Falha ao atualizar status da atividade.');
    }
  };

  if (!isHydrated) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <ActivityIndicator size="large" color={colors.ink} />
        <ThemedText variant="body" color={colors.muted} style={{ marginTop: spacing.md }}>
          Carregando atividades...
        </ThemedText>
      </View>
    );
  }

  const getSubtitle = () => {
    if (error) return undefined;
    if (selectedDiscipline) {
      return `${counts.all} em ${selectedDiscipline}`;
    }
    return `${tasks.length} cadastradas no total`;
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 20) + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentConstraint}>
          <Header
            title="Atividades"
            subtitle={getSubtitle()}
            showBack
            rightAction={
              error ? null : (
                <Button
                  title="Nova"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push('/task-form')}
                  leftIcon={<Feather name="plus" size={16} color={colors.white} />}
                />
              )
            }
          />

          {error ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorIcon}>
                <Feather name="alert-triangle" size={20} color={colors.coral} />
              </View>
              <View style={styles.errorContent}>
                <ThemedText variant="headline" color={colors.error}>
                  Erro de carregamento
                </ThemedText>
                <ThemedText variant="caption" color={colors.muted}>
                  {error}
                </ThemedText>
              </View>
              <Button
                title="Tentar novamente"
                size="sm"
                variant="outline"
                onPress={() => retryHydration().catch(() => {})}
              />
            </View>
          ) : (
            <>
              {/* Status filter tabs */}
              <View style={styles.filterSection}>
                <FilterPills
                  activeFilter={activeFilter}
                  onSelect={setActiveFilter}
                  counts={counts}
                />
              </View>

              {/* Disciplines horizontal scroll */}
              {disciplines.length > 0 && (
                <View style={styles.disciplineScrollWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.disciplineRow}
                  >
                    <Button
                      title="Todas as matérias"
                      size="sm"
                      variant={selectedDiscipline === null ? 'secondary' : 'outline'}
                      onPress={() => setSelectedDiscipline(null)}
                      style={styles.disciplinePill}
                    />
                    {disciplines.map((d) => (
                      <Button
                        key={d}
                        title={d}
                        size="sm"
                        variant={selectedDiscipline === d ? 'secondary' : 'outline'}
                        onPress={() => setSelectedDiscipline(selectedDiscipline === d ? null : d)}
                        style={styles.disciplinePill}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Task list inside an editorial sheet */}
              <View style={styles.listSection}>
                {filteredTasks.length === 0 ? (
                  <EmptyState
                    title={
                      activeFilter === 'completed'
                        ? 'Nenhuma concluída'
                        : activeFilter === 'pending'
                        ? 'Tudo em dia!'
                        : 'Nenhuma atividade encontrada'
                    }
                    description={
                      activeFilter === 'completed'
                        ? 'Conclua suas tarefas na lista para vê-las aqui.'
                        : activeFilter === 'pending'
                        ? 'Você não possui atividades pendentes no momento.'
                        : 'Cadastre suas primeiras atividades para organizar suas entregas.'
                    }
                    actionTitle={activeFilter !== 'completed' ? 'Nova atividade' : undefined}
                    onAction={() => router.push('/task-form')}
                    iconName={activeFilter === 'completed' ? 'check-circle' : 'file-text'}
                  />
                ) : (
                  <View style={styles.agendaSheet}>
                    {filteredTasks.map((task, idx) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={idx}
                        onToggle={handleToggleTask}
                        onPress={handleTaskPress}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: spacing.md,
  },
  contentConstraint: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(230, 103, 77, 0.4)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  filterSection: {
    paddingVertical: spacing.xs + 2,
  },
  disciplineScrollWrapper: {
    paddingVertical: spacing.xs,
  },
  disciplineRow: {
    gap: spacing.xs + 2,
    alignItems: 'center',
  },
  disciplinePill: {
    minHeight: 44, // 44dp touch target
    paddingHorizontal: spacing.sm + 4,
  },
  listSection: {
    paddingTop: spacing.xs,
  },
  agendaSheet: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
});
