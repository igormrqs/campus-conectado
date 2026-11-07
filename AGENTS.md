# Campus Conectado — regras para todos os agentes

## Objetivo
Construir um MVP **demo-first** de gestão de tarefas acadêmicas com nível visual excepcional, animações cuidadosas e funcionamento convincente em Android via Expo Go. O projeto é uma atividade acadêmica, não um SaaS. Evitar backend, autenticação, cloud, pagamentos e sobreengenharia.

## Norte do produto
Nome: Campus Conectado. Conceito visual: **Caderno em Movimento** — direção editorial contemporânea inspirada por cadernos, quadros de avisos e comunicação visual de campus, sem ícones 3D genéricos, gradientes roxo/azul padrão, glassmorphism gratuito ou estética de dashboard corporativo.

Leia `docs/DESIGN_DIRECTION.md`, `docs/EXECUTION_PLAN.md` e `docs/DEMO_SCENARIO.md` antes de alterar componentes.

## Escopo fechado
- Telas: Início (painel), Atividades (lista/filtros), Criar/Editar (uma experiência de formulário).
- CRUD real na interface: cadastrar, editar, excluir com confirmação, alternar pendente/concluído.
- Dados iniciais simulados com disciplinas e tarefas plausíveis, prazos relativos à data atual.
- Persistência **local** suficiente para reabrir o app sem perder as mudanças, preferencialmente via `expo-sqlite/kv-store` com JSON de tarefas; sem backend.
- Validação: título, disciplina e prazo obrigatórios; descrição opcional.
- Tela vazia, erro de formulário, prazos vencidos, datas e textos longos contemplados.
- Demo reset apenas em ambiente de desenvolvimento e sem interferir na experiência principal.

## Stack
React Native + Expo + TypeScript, Expo Router, React Native Reanimated, expo-haptics, expo-sqlite/kv-store, StyleSheet, SVG se necessário, fonts via expo-font / @expo-google-fonts. Preferir dependências suportadas pelo SDK instalado; verificar com `npx expo install`.

## Contrato compartilhado de dados
Definir uma única fonte de verdade em `src/features/tasks`:
```
type Task = {
  id: string;
  title: string;
  discipline: string;
  description: string;
  dueAt: string; // ISO date
  completed: boolean;
  createdAt: string; // ISO date-time
};
type TaskInput = Pick<Task, 'title'|'discipline'|'description'|'dueAt'>;
```
O hook `useTasks()` deve oferecer:
```
{
 tasks: Task[]; isHydrated: boolean;
 addTask(input: TaskInput): Promise<void>;
 updateTask(id: string, patch: Partial<TaskInput>): Promise<void>;
 deleteTask(id: string): Promise<void>;
 toggleTask(id: string): Promise<void>;
 resetDemo(): Promise<void>;
}
```
O coordenador pode ajustar a implementação, mas deve documentar o contrato **antes** dos workers começarem. Não alterar assinatura pública de forma unilateral.

## Motion & interação
Priorizar animações de 180–420 ms por transição; animar transform e opacity. Usar springs com moderação. Interações essenciais: entrada escalonada dos cartões, transição abrir formulário, mudança de status com feedback tátil, atualização de progresso, filtro ativo e sucesso ao salvar. Respeitar redução de movimento. Evitar animação infinita, Lottie genérico e efeitos que prejudiquem 60 fps.

## Definição de pronto
- `npx tsc --noEmit` sem erros; app abre no Expo Go / emulador Android.
- Fluxo de demo: abrir, filtrar, concluir, cadastrar, editar, apagar, reiniciar e conferir persistência.
- Sem handlers vazios, botões falsos, lorem ipsum, imagens irrelevantes ou placeholders inacabados.
- README curto com execução e limites da simulação. Capturas de tela reais quando houver dispositivo/emulador.

## Cooperação e custo
Codex é **coordenador e revisor**, não executor habitual. OpenCode realiza lógica, dados e tarefas repetitivas. Antigravity realiza interface, design system e motion. Limite de dois workers simultâneos; não duplicar trabalhos, não disparar refações inteiras sem revisão humana. Cada tarefa termina com resumo, arquivos alterados, testes executados e limitações. Proibir comandos destrutivos, gastos de API/cloud, deploy e publicação sem aprovação explícita.
