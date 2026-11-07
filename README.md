# Campus Conectado

MVP acadêmico Expo/React Native/TypeScript, com identidade **Caderno em Movimento**.
Início, Atividades e formulário Criar/Editar; filtros, conclusão, exclusão com
confirmação e animações com redução de movimento. Sem backend ou login.

As 11 atividades iniciais são fictícias e recebem prazos relativos ao primeiro
acesso. Alterações são reais: SQLite no Android e localStorage no navegador.
Apagar todas as atividades não recria a seed. Desinstalar/limpar dados apaga o
caderno local; não há sincronização ou backup remoto.

## Executar

Node 24 e npm; versões exatas no lockfile. Expo SDK 58 / React Native 0.88.1.

```powershell
npm ci --ignore-scripts
npx tsc --noEmit
npx expo start
```

Abra com Expo Go compatível com SDK 58 ou pressione `w` para a versão web.
Para porta fixa no navegador: `npm run web -- --port 8081`.

## Verificar

```powershell
npm run typecheck
npm test
```

O teste completo de interface requer Metro em `http://localhost:8081`:

```powershell
npx playwright install chromium
npm run test:e2e
```

Se já tiver Edge no Windows, pode usá-lo sem baixar Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

O teste usa um perfil isolado e cobre criação, edição, filtros, conclusão,
confirmação de exclusão, reabertura do navegador, estados vazio/erro e retry.
Capturas e resultados ficam em [docs/evidence](docs/evidence).
Consulte [validação real](docs/VALIDATION.md) para resultados e limites.

## APK instalável

**APK gerado e verificado:** [baixar CampusConectado.apk](https://expo.dev/artifacts/eas/T61Y6cOqc-xKsdsVOnkqWaqcB8OwSKVENcbh7urxQzM.apk).
Arquivo local: `artifacts/CampusConectado.apk` (102.270.223 bytes, 97,53 MiB).
O link EAS tem expiração prevista em 21/11/2026; guarde a cópia local.

Build release standalone, com bundle, fontes, seed e SQLite incorporados;
não requer Expo Go nem servidor Metro. Assinatura APK v2 validada com
`apksigner verify --verbose --print-certs`; manifesto conferido com `aapt`:
Campus Conectado 1.0.0 (1), `br.edu.campusconectado.demo`, Android 7.0+,
arquiteturas ARM64, ARMv7, x86 e x86_64, sem `debuggable`.

SHA-256 do APK:
`3c88675355634760756ff053647dc861d75ab66eca20fffccf92bf2b3cdd9ce8`.
O arquivo `.sha256` está junto da cópia local.

O build usou uma unidade da cota Android do plano Free, com custo adicional
estimado de zero. Evidência em [apk-verification.json](docs/evidence/apk-verification.json).
Não houve instalação ou execução em aparelho/emulador: nenhum estava conectado.

O perfil `preview` de [eas.json](eas.json) usa `internal` / `apk`;
nome, identificador e ícone próprio estão em app.json. Para gerar outra versão:

```powershell
npx --yes eas-cli@latest login
npx --yes eas-cli@latest build --platform android --profile preview
```

O projeto Expo já está vinculado e a keystore fica no serviço de credenciais
do EAS, fora do repositório. Use apenas a cota gratuita; não aceite cobrança.
Baixe o novo artefato pelo link informado ao final do build.

Transfira o APK ao celular, abra-o e permita a instalação pelo gerenciador de
arquivos quando o Android pedir. Alternativa com Platform Tools:
`adb install -r .\CampusConectado.apk`. Abra o app, ative modo avião, execute o
CRUD, force o fechamento e reabra para conferir persistência.

O caminho local gratuito, com JDK/SDK instalados, é
`& .\scripts\build-android-apk.ps1`; o script rejeita APK sem assinatura e só
entrega `dist/android/CampusConectado.apk` após `apksigner verify`.
Requisitos e detalhes em [docs/APK_BUILD.md](docs/APK_BUILD.md).

## Apresentação e limites

Siga [o roteiro de cinco minutos](docs/DEMO_SCENARIO.md): início → filtros →
concluir → cadastrar apresentação → editar → excluir → reabrir.
Restaurar demo aparece apenas em desenvolvimento; não é exposto no APK release.
Haptics, teclado Android, TalkBack e desempenho em aparelho ainda não foram
verificados. `npm audit` registra cinco vulnerabilidades moderadas na cadeia
Expo/CLI, sem altas/críticas; não foi aplicado downgrade forçado do SDK.
