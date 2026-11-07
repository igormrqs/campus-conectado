# Build do APK — Campus Conectado

Atualizado em 07/11/2026. **APK gerado, baixado e verificado.**

- Arquivo local: `artifacts/CampusConectado.apk`, 102.270.223 bytes (97,53 MiB).
- [Download do APK](https://expo.dev/artifacts/eas/T61Y6cOqc-xKsdsVOnkqWaqcB8OwSKVENcbh7urxQzM.apk).
- [Build EAS concluído](https://expo.dev/accounts/igormrqs/projects/campus-conectado/builds/17fa2dc9-4d6e-426d-96b5-7e25f5f9e4fe),
  finalizado em 07/11/2026 19:49:18 UTC. Retenção prevista até 21/11/2026.
- SHA-256: `3c88675355634760756ff053647dc861d75ab66eca20fffccf92bf2b3cdd9ce8`.
- Assinatura APK v2 válida (RSA 2048); Android 7.0+, target SDK 36.
- Plano Free: 1 de 15 builds Android usados; custo adicional estimado de zero.

Verificação real com Android Build Tools 36.0.0 (`apksigner` e `aapt`) e
Temurin JRE 21 portáteis, obtidos de Google/Adoptium com checksums conferidos.
Essas ferramentas não instalaram um JDK/SDK de compilação no sistema.
O ADB portátil confirmou lista de dispositivos vazia. **Instalação e execução
Android não foram testadas.** Resultados em `docs/evidence/apk-verification.json`,
`apk-signature.txt` e `apk-badging.txt`.

Pacote Android congelado no `app.json`: `br.edu.campusconectado.demo`.
Nome exibido: `Campus Conectado`. O APK standalone embute o bundle JavaScript e
não depende de Metro; na primeira abertura cria as 11 atividades de demonstração
e persiste as alterações no SQLite local (`expo-sqlite/kv-store`). A versão web
usa o adapter `localStorage` da mesma camada de dados, sem WASM nem headers
especiais.

## Caminho recomendado: EAS Build perfil `preview`

O `eas.json` na raiz já define `distribution: internal` e `android.buildType: apk`.
O projeto `@igormrqs/campus-conectado` está vinculado pelo `extra.eas.projectId`
de `app.json`. A assinatura foi gerada pelo EAS e permanece no serviço de
credenciais; nenhum segredo foi gravado no Git.

Pré-requisitos: conta Expo gratuita autenticada e conexão. A cota gratuita pode
entrar em fila; não aceite cobrança.

```sh
npx --yes eas-cli@latest login
npx --yes eas-cli@latest build --platform android --profile preview
```

Em um projeto ainda não vinculado, o EAS pode:

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
& .\scripts\build-android-apk.ps1
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

## Conferência e instalação

- Ícone próprio e adaptive icon aplicados em `app.json` e recursos do APK.
- Manifesto: Campus Conectado, versão 1.0.0 (1), pacote correto, não debuggable.
- APK contém `assets/index.android.bundle`, 34 fontes e SQLite para quatro ABIs.
  Os marcadores da seed e da chave de persistência foram encontrados no bundle.
- Transfira `CampusConectado.apk` ao Android, abra-o e permita a instalação pelo
  gerenciador de arquivos quando o sistema solicitar. Com ADB:
  `adb install -r .\artifacts\CampusConectado.apk`.
- Abra sem Metro/Expo Go, ative modo avião, execute o CRUD e force o fechamento;
  reabra para conferir persistência. Este teste em aparelho permanece pendente.

## Limitações

- Não foi feito build Android local nem instalação/execução em aparelho.
- Tamanho, assinatura, manifesto e conteúdo do APK foram verificados; teclado,
  haptics, aparência do launcher e desempenho em Android permanecem sem teste.
- O perfil `production` gera AAB para loja; não é necessário para a demo.

Referências oficiais: [gerar APK](https://docs.expo.dev/build-reference/apk/),
[build local](https://docs.expo.dev/guides/local-app-production/) e
[limites do EAS local no Windows](https://docs.expo.dev/build-reference/local-builds/).
