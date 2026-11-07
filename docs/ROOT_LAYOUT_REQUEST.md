# Solicitação de Integração do Layout Raiz (`app/_layout.tsx`)

**Autor:** Antigravity (Worker B — UI & Motion)  
**Destinatário:** Codex (Coordenador)  
**Data:** 2026-11-07  

---

## 1. Contexto

Conforme determinado em `AGENTS.md` e `docs/WORKER_UI.md`, o arquivo `app/_layout.tsx` é propriedade exclusiva do coordenador (Codex).
Para integrar o design system editorial **Caderno em Movimento**, as fontes pré-instaladas (`Bricolage Grotesque` e `Instrument Sans`), a barra de status com a paleta editorial e as opções nativas de navegação com transição modal no formulário de tarefas, solicitamos a aplicação da implementação abaixo.

---

## 2. Código Exato para `app/_layout.tsx`

```tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from '@expo-google-fonts/instrument-sans';

import { TasksProvider } from '@/src/features/tasks';
import { colors } from '@/src/design/tokens';

// Mantém a splash screen nativa visível durante o carregamento de fontes
SplashScreen.preventAutoHideAsync().catch(() => {
  /* No-op em web ou se já evitado */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        /* No-op se já escondido */
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <TasksProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: 'default',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Início',
            }}
          />
          <Stack.Screen
            name="activities"
            options={{
              title: 'Atividades',
            }}
          />
          <Stack.Screen
            name="task-form"
            options={{
              presentation: 'modal',
              title: 'Atividade',
            }}
          />
        </Stack>
      </TasksProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 3. Justificativas Técnicas

1. **Carregamento de Fontes Locais (`expo-font` / `@expo-google-fonts`):**
   - As famílias `BricolageGrotesque_700Bold`, `BricolageGrotesque_800ExtraBold`, `InstrumentSans_400Regular`, `InstrumentSans_500Medium` e `InstrumentSans_600SemiBold` já constam em `package.json` e correspondem exatamente aos tokens congelados em `src/design/tokens.ts`.
   - O uso de `SplashScreen.preventAutoHideAsync()` impede qualquer layout shift ou flash de fonte do sistema durante a abertura do app.

2. **StatusBar Editorial:**
   - `<StatusBar style="dark" backgroundColor={colors.paper} />` garante coerência com o fundo quente de caderno (`#F7F5EF`) tanto no Android quanto no iOS.

3. **Navegação Nativa e Transição Modal:**
   - A rota `/task-form` é apresentada com `presentation: 'modal'`, atendendo às diretrizes de motion da skill `expo-animation` e `expo-router` para formulários autocontidos com transição nativa fluida.
   - Os cabeçalhos nas telas são renderizados com suporte integral a Safe Areas (`react-native-safe-area-context`) e identidade editorial personalizada da direção "Caderno em Movimento".
