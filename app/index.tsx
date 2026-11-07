import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTasks, Task } from '@/src/features/tasks';
import { colors, spacing, radius } from '@/src/design/tokens';
import { formatEditorialDate, isOverdue, getTodayDateString } from '@/src/design/date-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { ProgressCard } from '@/src/components/ProgressCard';
import { TaskCard } from '@/src/components/TaskCard';
import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/Header';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isHydrated, error, retryHydration, toggleTask, deleteTask, resetDemo } = useTasks();

  const editorialDate = useMemo(() => formatEditorialDate(), []);
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Compute stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueAt, t.completed)).length;

  // Radar tasks: overdue or due today/tomorrow, or top pending tasks
  const radarTasks = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    // Sort: overdue first, then by dueAt
    pending.sort((a, b) => a.dueAt.localeCompare(b.dueAt));

    if (pending.length >= 3) {
      return pending.slice(0, 3);
    }
    // If few pending, add some completed to fill up to 3
    const completed = tasks.filter((t) => t.completed);
    return [...pending, ...completed].slice(0, 3);
  }, [tasks]);

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/task-form',
      params: { id: task.id },
    });
  };

  const handleResetDemoPrompt = () => {
    Alert.alert(
      'Reiniciar demonstração',
      'Deseja restaurar as atividades iniciais do semestre?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDemo();
            } catch (err) {
              Alert.alert('Aviso', 'Não foi possível reiniciar a demo.');
            }
          },
        },
      ]
    );
  };

  if (!isHydrated) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <ActivityIndicator size="large" color={colors.ink} />
        <ThemedText variant="headline" style={styles.loadingTitle}>
          Campus Conectado
        </ThemedText>
        <ThemedText variant="body" color={colors.muted}>
          Carregando caderno do semestre...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 24) + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header eyebrow={editorialDate} />

        <View style={styles.heroSection}>
          <ThemedText variant="hero" style={styles.heroTitle}>
            Seu semestre{'\n'}tem ritmo.
          </ThemedText>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <View style={styles.errorIcon}>
              <Feather name="alert-triangle" size={20} color={colors.coral} />
            </View>
            <View style={styles.errorContent}>
              <ThemedText variant="headline" color={colors.coral}>
                Erro de armazenamento
              </ThemedText>
              <ThemedText variant="caption" color={colors.muted}>
                {error}
              </ThemedText>
            </View>
            <Button
              title="Tentar"
              size="sm"
              variant="outline"
              onPress={() => retryHydration()}
            />
          </View>
        ) : null}

        <ProgressCard
          total={totalCount}
          completed={completedCount}
          overdueCount={overdueCount}
        />

        <View style={styles.sectionHeaderRow}>
          <ThemedText variant="section" style={styles.sectionTitle}>
            Hoje no radar
          </ThemedText>
          <Button
            title="Ver todas"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/activities')}
            rightIcon={<Feather name="chevron-right" size={16} color={colors.ink} />}
          />
        </View>

        {radarTasks.length === 0 ? (
          <EmptyState
            title="Tudo tranquilo no radar"
            description="Você não possui atividades pendentes urgentes para hoje."
            actionTitle="Adicionar atividade"
            onAction={() => router.push('/task-form')}
            iconName="check-circle"
          />
        ) : (
          radarTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              index={idx}
              onToggle={toggleTask}
              onPress={handleTaskPress}
              onDelete={deleteTask}
            />
          ))
        )}

        <View style={styles.primaryActionRow}>
          <Button
            title="Nova atividade"
            size="lg"
            variant="primary"
            fullWidth
            onPress={() => router.push('/task-form')}
            leftIcon={<Feather name="plus" size={20} color={colors.white} />}
          />
        </View>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Button
              title="Restaurar dados da demo"
              variant="ghost"
              size="sm"
              onPress={handleResetDemoPrompt}
              leftIcon={<Feather name="refresh-cw" size={14} color={colors.muted} />}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  heroTitle: {
    letterSpacing: -0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    letterSpacing: -0.3,
  },
  primaryActionRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
    borderColor: colors.coral,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  devSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
