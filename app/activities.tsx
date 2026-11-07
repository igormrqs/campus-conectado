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
import { useTasks, Task } from '@/src/features/tasks';
import { colors, spacing, radius } from '@/src/design/tokens';
import { isOverdue } from '@/src/design/date-utils';
import { showAlert } from '@/src/design/platform-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { TaskCard } from '@/src/components/TaskCard';
import { FilterPills, TaskFilterType } from '@/src/components/FilterPills';
import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/Header';

export default function ActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isHydrated, error, retryHydration, toggleTask, deleteTask } = useTasks();

  const [activeFilter, setActiveFilter] = useState<TaskFilterType>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  // Discipline chips list from existing tasks
  const disciplines = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.discipline) set.add(t.discipline.trim());
    });
    return Array.from(set).sort();
  }, [tasks]);

  const counts = useMemo(() => {
    const all = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = all - completed;
    return { all, pending, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by status
      if (activeFilter === 'pending' && task.completed) return false;
      if (activeFilter === 'completed' && !task.completed) return false;

      // Filter by discipline if selected
      if (selectedDiscipline && task.discipline.toLowerCase() !== selectedDiscipline.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize overdue tasks that are pending
      const aOverdue = isOverdue(a.dueAt, a.completed);
      const bOverdue = isOverdue(b.dueAt, b.completed);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Uncompleted tasks before completed
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      return a.dueAt.localeCompare(b.dueAt);
    });
  }, [tasks, activeFilter, selectedDiscipline]);

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

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Falha ao excluir atividade.');
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

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title="Atividades"
          subtitle={`${tasks.length} cadastradas no total`}
          showBack
          rightAction={
            <Button
              title="Nova"
              size="sm"
              variant="primary"
              onPress={() => router.push('/task-form')}
              leftIcon={<Feather name="plus" size={16} color={colors.white} />}
            />
          }
        />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <View style={styles.errorIcon}>
            <Feather name="alert-triangle" size={20} color={colors.coral} />
          </View>
          <View style={styles.errorContent}>
            <ThemedText variant="headline" color={colors.coral}>
              Erro de carregamento
            </ThemedText>
            <ThemedText variant="caption" color={colors.muted}>
              {error}
            </ThemedText>
          </View>
          <Button
            title="Tentar"
            size="sm"
            variant="outline"
            onPress={() => retryHydration().catch(() => {})}
          />
        </View>
      ) : null}

      <View style={styles.filterSection}>
        <FilterPills
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          counts={counts}
        />
      </View>

      {disciplines.length > 1 && (
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

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
          filteredTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              index={idx}
              onToggle={handleToggleTask}
              onPress={handleTaskPress}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    backgroundColor: '#FFF5F3',
    borderColor: colors.coral,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disciplineScrollWrapper: {
    paddingBottom: spacing.xs,
  },
  disciplineRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs + 2,
  },
  disciplinePill: {
    minHeight: 36,
    paddingHorizontal: spacing.sm + 4,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});
