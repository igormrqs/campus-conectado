# Build do APK — Campus Conectado

Atualizado em 07/11/2026. **Nenhum APK foi gerado nesta tarefa.** O ambiente não
tem Java, Android SDK, Gradle, adb nem EAS autenticado; portanto não há artefato
para declarar ou instalar.

Pacote Android congelado no `app.json`: `br.edu.campusconectado.demo`.
Nome exibido: `Campus Conectado`. O APK standalone embute o bundle JavaScript e
não depende de Metro; na primeira abertura cria as 11 atividades de demonstração
e persiste as alterações no SQLite local (`expo-sqlite/kv-store`). A versão web
usa o adapter `localStorage` da mesma camada de dados, sem WASM nem headers
especiais.

## Caminho recomendado: EAS Build perfil `preview`

O `eas.json` na raiz já define `distribution: internal` e `android.buildType: apk`.
Não foi disparado nenhum build em nuvem nesta tarefa.

Pré-requisitos: conta Expo gratuita autenticada e conexão. A cota gratuita pode
entrar em fila; não aceite cobrança.

```sh
npx --yes eas-cli@latest login
npx --yes eas-cli@latest build --platform android --profile preview
```

Na primeira execução o EAS pode:

1. criar o projeto Expo e gravar `extra.eas.projectId` no `app.json` — revise o diff;
2. oferecer a geração de uma keystore Android — aceite para obter um APK assinado;
3. exibir a URL do artefato ao final.

O resultado é um APK instalável. Baixe o arquivo e instale no aparelho habilitando
"instalar apps desconhecidos" para o gerenciador de arquivos, ou use
`adb install -r caminho\para\build.apk` em uma máquina com Android Platform Tools.
Não há adb disponível no ambiente atual.

## Caminho local (gratuito, sem nuvem)

O script `scripts/build-android-apk.ps1` valida pré-requisitos, roda o prebuild e
chama `gradlew assembleRelease`. Ele não instala nada, não acessa a rede do EAS e
foi apenas validado sintaticamente. Requisitos:

- JDK 17 com `JAVA_HOME` configurado (~300 MB); o script imprime o `java -version`
  escolhido e `gradlew -version` para confirmar a JVM usada;
- Android SDK com platform/build-tools, `apksigner` e NDK exigidos pelo React
  Native (~6–8 GB);
- espaço livre para Gradle/cache (mais ~1–2 GB no primeiro build);
- `ANDROID_HOME` ou `ANDROID_SDK_ROOT` apontando para o SDK;
- `node_modules` instalado (`npm install --ignore-scripts`).

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
powershell -ExecutionPolicy Bypass -File .\scripts\build-android-apk.ps1
```

O script rejeita `app-release-unsigned.apk`, roda
`apksigner verify --print-certs` e só copia um APK aprovado para
`dist/android/CampusConectado.apk`, imprimindo SHA-256. Se a variante release não
estiver assinada, o comando falha com mensagem clara e o caminho EAS `preview`
passa a ser obrigatório. Para conferir manualmente:

```sh
apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk
```

Para assinatura local controlada, o caminho documentado pelo Expo é criar uma
keystore e um `credentials.json` fora do controle de versão. Não criei nem
commitei credenciais. O diretório `android/` gerado pelo prebuild também não deve
ser commitado neste projeto CNG.

## Pendências para o coordenador

- Aplicar `assets/campus-icon.png` e os campos de ícone/adaptive icon no
  `app.json` quando o asset estiver pronto.
- Autorizar/executar o login Expo e o build `preview`; sem login não há APK.
- Adicionar `/android` e `/ios` ao `.gitignore` antes de rodar o prebuild local.
- Registrar o caminho e o hash do APK real recebido; não reutilizar este texto
  como prova de build.

## Limitações

- Não foi feito build Android local, cloud ou instalação em aparelho.
- Não foi possível validar tamanho, assinatura, ícone ou inicialização do APK.
- O perfil `production` gera AAB para loja; não é necessário para a demo.
