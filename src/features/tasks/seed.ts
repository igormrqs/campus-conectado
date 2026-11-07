import { addCalendarDays, formatCalendarDate } from './date';
import type { Task } from './types';

type SeedSpec = {
  title: string;
  discipline: string;
  description: string;
  /** Whole days relative to the first launch. */
  dueOffset: number;
  completed: boolean;
};

/**
 * Plausible demo content. Due dates are computed from the first hydration so
 * the presentation always has overdue, today, tomorrow and future work.
 */
const SEED_SPECS: readonly SeedSpec[] = [
  {
    title: 'Revisar árvores binárias',
    discipline: 'Estruturas de Dados',
    description: 'Refazer os exercícios de percurso em ordem e anotar as dúvidas para a monitoria.',
    dueOffset: 0,
    completed: false,
  },
  {
    title: 'Normalizar esquema do banco',
    discipline: 'Banco de Dados',
    description: 'Conferir chaves candidatas e dependências funcionais do modelo de empréstimos.',
    dueOffset: 0,
    completed: true,
  },
  {
    title: 'Entregar DER do projeto',
    discipline: 'Banco de Dados',
    description:
      'Exportar o diagrama com cardinalidades, chaves primárias e estrangeiras. Incluir uma página de decisões de modelagem e revisar os nomes antes de enviar no ambiente da disciplina.',
    dueOffset: 1,
    completed: false,
  },
  {
    title: 'Preparar apresentação de UX',
    discipline: 'Engenharia de Software',
    description: 'Fechar o roteiro de cinco minutos e ensaiar a demonstração do fluxo principal.',
    dueOffset: 3,
    completed: false,
  },
  {
    title: 'Finalizar telas do MVP',
    discipline: 'Desenvolvimento Mobile',
    description: 'Ajustar estados vazios e revisar os textos da entrega parcial no Expo Go.',
    dueOffset: 3,
    completed: false,
  },
  {
    title: 'Resolver lista de integrais',
    discipline: 'Cálculo',
    description: 'Priorizar substituição trigonométrica e conferir as respostas ímpares.',
    dueOffset: -1,
    completed: false,
  },
  {
    title: 'Estudar protocolos de rede',
    discipline: 'Redes de Computadores',
    description: 'Comparar TCP e UDP com exemplos de aplicação e revisar o material de encapsulamento.',
    dueOffset: 7,
    completed: false,
  },
  {
    title: 'Revisar limites e continuidade',
    discipline: 'Cálculo',
    description: 'Montar um resumo de uma página com os critérios usados em prova.',
    dueOffset: 7,
    completed: true,
  },
  {
    title: 'Testar navegação offline',
    discipline: 'Desenvolvimento Mobile',
    description: 'Abrir o app sem rede, criar uma atividade e confirmar que o estado continua após reiniciar.',
    dueOffset: 10,
    completed: false,
  },
  {
    title: 'Registrar ata da sprint',
    discipline: 'Engenharia de Software',
    description: 'Consolidar decisões da reunião e distribuir os próximos passos no quadro do time.',
    dueOffset: -2,
    completed: true,
  },
  {
    title: 'Implementar tabela hash',
    discipline: 'Estruturas de Dados',
    description: 'Resolver colisões por encadeamento e medir o fator de carga com dados de teste.',
    dueOffset: -4,
    completed: true,
  },
];

/** Creates a fresh, valid demo dataset anchored to the supplied date. */
export function createSeed(now: Date = new Date()): Task[] {
  return SEED_SPECS.map((spec, index) => ({
    id: `seed-${String(index + 1).padStart(2, '0')}`,
    title: spec.title,
    discipline: spec.discipline,
    description: spec.description,
    dueAt: formatCalendarDate(addCalendarDays(now, spec.dueOffset)),
    completed: spec.completed,
    createdAt: new Date(now.getTime() - (index + 1) * 3_600_000).toISOString(),
  }));
}
