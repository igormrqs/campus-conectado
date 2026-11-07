import { Stack } from 'expo-router/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TasksProvider } from '@/src/features/tasks';
import { colors } from '@/src/design/tokens';

// Coordinator-owned integration boundary. UI worker sends requested changes as a patch.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TasksProvider>
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.paper } }} />
      </TasksProvider>
    </GestureHandlerRootView>
  );
}
