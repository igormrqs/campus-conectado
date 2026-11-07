# Ambiente inicial — 07/11/2026

- Windows / PowerShell; Node 24.21.0; npm 11.19.0; Orca 1.4.250.
- Repositório inicialmente sem app: somente kit e skills não rastreados.
- Template oficial blank-typescript SDK 58; Expo ~58.0.23, React 19.3.0,
  React Native 0.88.1, TypeScript ~6.0.3. Versões exatas no package-lock.json.
- Instalação com scripts npm desabilitados; dependências nativas resolvidas por
  `npx expo install`. `npx expo install --check`: dependências atualizadas.
- Nenhum emulador anexado (`orca emulator list --json`); adb ausente do PATH.
  Nenhum teste em aparelho foi realizado nesta etapa. Expo Go deve corresponder
  ao SDK: https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/.
- `npm audit`: 5 moderadas (expo, @expo/cli, @expo/fingerprint, glob, minimatch),
  zero altas/críticas. Remediação proposta pelo npm rebaixa Expo para 53.0.11;
  não aplicada para não invalidar o SDK. Sem serviços pagos adicionados.
- Orca runtime/graph prontos; comandos de orchestration disponíveis.

Scaffold é compilável, mas `useTasks` e validação ainda lançam erro explícito:
implementação pertence ao OpenCode. A tela inicial não usa o hook nessa etapa.
