# Plano de execução — dois workers e um coordenador

## Preparação (Codex)
- Criar projeto Expo no repositório e primeiro commit estável; iniciar Expo Go no Android.
- Ler a documentação/skills oficiais, registrar versão de SDK e dependências.
- Definir contrato `Task`, hook `useTasks()` e tokens em `src/design/tokens.ts` (mesmo que temporários) antes do paralelismo.
- Congelar direção visual em DESIGN_DIRECTION.md; indicar ownership por diretório.

## Worker A: OpenCode (data e funcionalidade)
**Arquivos de responsabilidade:** `src/features/tasks/**`, `src/data/**`, testes locais e utilitários.

Entregar: seed idempotente de 10–12 tarefas, estado em memória, persistência em `expo-sqlite/kv-store`, hook com API acordada, validação, create/update/delete/toggle/resetDemo e tratamento de erros. Não editar telas, fontes, cores ou rotas. Ao terminar, rodar TypeScript/qualquer teste disponível e resumir resultado.

## Worker B: Antigravity (visual e motion)
**Arquivos de responsabilidade:** `src/components/**`, `src/design/**` (exceto tokens congelados), `app/**` ou `src/app/**` conforme template, exceto layout raiz se marcado como propriedade do coordenador.

Entregar: 3 telas completas em português, identidade editorial, cards, lista, formulário e animações com Reanimated. Usar `useTasks()` conforme contrato documentado. No início, se hook ainda não estiver pronto, pode criar `src/components/PreviewTaskData.ts` temporário **apenas para desenvolvimento**, removendo antes de merge. Não editar persistência ou tipos partilhados. Testar manualmente no Android e inspecionar screenshots.

## Coordenador: Codex
- Disparar workers via Orca e sair da execução ativa; evitar consumir tokens supervisionando continuamente.
- Integrar branches uma de cada vez. Resolver conflitos em código compartilhado sem excluir trabalho.
- Rodar `npx tsc --noEmit` e teste no dispositivo/emulador.
- Fazer uma rodada crítica de design: contraste, hierarquia, espaço, fluidez, teclado, safe areas, fluxo de demo.
- Pedir no máximo 2 correções direcionadas por worker, nunca refazer o app inteiro.
- Documentar README e 6 evidências de teste.

## Critérios de parada de custo
- Máximo 2 workers simultâneos.
- Codex não executa implementação ampla, só contrato, revisão e integração.
- OpenCode: tarefas mecânicas/CRUD/README; modelos baratos se já estiverem disponíveis em conta.
- Antigravity: UI/UX, telas e animações; limitar a 3 telas e 5 interações memoráveis.
- Sem Figma obrigatório, serviços cloud, analytics, EAS paid ou backend.
- Manter os 5 minutos de demo como norte; tudo extra fica fora de escopo.
