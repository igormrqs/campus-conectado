# Design atual — Campus Conectado

[Abrir galeria visual](index.html) · [Ler revisão](REVISAO.md) · [Origem das capturas](manifest.json)

14 capturas novas em 07/11/2026, do código no commit `9b91171`. As imagens são
da versão **web em viewport de celular**, não do APK. Nenhum Android estava
conectado ao ADB. O funcionamento do APK foi confirmado pelo usuário.

## Comece por estas imagens

| Tela | Imagem |
|---|---|
| Início | [01 — primeira dobra](01-inicio-412.png) |
| Lista de atividades | [03 — todas](03-atividades-todas-412.png) |
| Formulário | [06 — parte superior](06-criar-topo-412.png) |
| Formulário e botão principal | [07 — rodapé](07-criar-rodape-412.png) |
| Celular menor | [13 — início em 360 px](13-inicio-360.png) |

## Estados adicionais

| Imagem | Estado |
|---|---|
| [02](02-inicio-rodape-412.png) | Rodapé do início |
| [04](04-atividades-pendentes-412.png) | Pendentes |
| [05](05-atividades-concluidas-412.png) | Concluídas |
| [08](08-criar-validacao-412.png) | Erros inline no formulário |
| [09](09-editar-412.png) | Edição de atividade |
| [10](10-lista-vazia-412.png) | Lista vazia |
| [11](11-tudo-concluido-412.png) | Todas as atividades concluídas |
| [12](12-erro-armazenamento-412.png) | Falha de armazenamento |
| [14](14-criar-360.png) | Formulário em 360 px |

## Diferenças em relação ao APK

- Web usa campo de data ISO; Android usa seletor nativo e botão Outra data.
- O botão de restaurar demo no rodapé web é exclusivo do desenvolvimento.
- Teclado, barras de sistema, TalkBack, haptics e transições nativas não estão
  representados. Prints estáticos não validam qualidade de motion.
- Alterações de dados usadas para mostrar estados ocorreram somente em um
  contexto novo do navegador, sem acesso aos dados do celular ou do browser do usuário.

## Como enviar diretrizes

Use o número da imagem e descreva o elemento e a mudança desejada. Exemplo:
"01: reduzir o cabeçalho; 03: cartões mais compactos; 06: menos sugestões de
disciplina; manter azul e papel quente". Se uma parte já estiver boa, indique
também o que deve ser preservado. Referências visuais são bem-vindas.

Reproduzir com Metro na porta 8081: `node scripts/capture-design-review.cjs`.
O script usa Edge headless e encerra seu próprio contexto; o Metro existente
permanece disponível.
