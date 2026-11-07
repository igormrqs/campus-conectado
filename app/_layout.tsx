import { Stack } from 'expo-router/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { InstrumentSans_400Regular, InstrumentSans_500Medium, InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans';
import { useReducedMotion } from 'react-native-reanimated';
import { TasksProvider } from '@/src/features/tasks';
import { colors } from '@/src/design/tokens';

// Coordinator-owned integration boundary; font assets are bundled, never fetched.
export default function RootLayout() {
  const reducedMotion = useReducedMotion();
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
    InstrumentSans_400Regular, InstrumentSans_500Medium, InstrumentSans_600SemiBold,
  });
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.paper }}>
      <ActivityIndicator accessibilityLabel="Preparando seu caderno" color={colors.blue} />
    </View>;
  }
  if (fontError) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.paper }}>
      <Text selectable>Não foi possível carregar as fontes locais. Reabra o aplicativo.</Text>
    </View>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <TasksProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: reducedMotion ? 'fade' : 'default' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="activities" options={{ animation: 'none' }} />
            <Stack.Screen name="task-form" options={{ presentation: 'modal' }} />
          </Stack>
        </TasksProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
