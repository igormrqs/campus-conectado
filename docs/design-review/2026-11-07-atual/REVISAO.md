# Revisão do design atual — Campus Conectado

Método: revisão de design nativo por código e capturas web; detector de markup
não aplicável ao produto React Native. Avaliação por um revisor, sem novos
workers. Fonte: commit `9b91171`, capturas em `manifest.json`, modo Operate.
As notas abaixo são julgamento de revisão, não resultado de teste com usuários.

## Veredito

A paleta papel/tinta/azul/lima e a dupla tipográfica dão uma base coerente.
O aplicativo já tem identidade, mas sua composição ainda depende de um padrão
comum: título grande, cartão de métrica e sequência de cartões iguais. A maior
oportunidade é usar melhor o espaço para a tarefa acadêmica e tornar o conceito
Caderno em Movimento mais presente na hierarquia e nos detalhes.

## Saúde de design — 28/40, bom com refinamentos necessários

| Heurística | Nota /4 | Evidência ou limite |
|---|---:|---|
| Visibilidade do estado | 3 | Progresso, status e validação visíveis; radar contraditório quando tudo termina |
| Linguagem do cotidiano | 3 | Disciplinas e prazos claros; data ISO aparece na apresentação do prazo |
| Controle e liberdade | 3 | Voltar/cancelar e confirmação de excluir; sem recuperação de rascunho |
| Consistência | 3 | Primitivas compartilhadas; inputs não declaram a família tipográfica do corpo |
| Prevenção de erros | 3 | Validação inline e confirmação antes de excluir |
| Reconhecimento | 3 | Sugestões e filtros visíveis; editar pelo texto do cartão não é explicado visualmente |
| Eficiência | 3 | Atalhos de data/disciplina e conclusão direta; cartões exigem muita rolagem |
| Estética e síntese | 2 | Paleta coerente, mas abertura e cartões ocupam altura excessiva |
| Recuperação de erros | 3 | Mensagens e retry preservam dados; coral pequeno prejudica legibilidade |
| Ajuda e orientação | 2 | Placeholders e README ajudam; instruções de interação são discretas |
| **Total** | **28/40** | Não implica validação de teclado, TalkBack ou motion no Android |

## O que preservar

- Papel quente e tinta dão bom contraste e um ambiente menos corporativo.
- Bricolage Grotesque nos títulos e Instrument Sans no corpo estabelecem uma
  hierarquia reconhecível; o CTA azul é visível.
- Filtros com contagem, conclusão direta e confirmação de exclusão ajudam a demo.

## Prioridades

### 1. P1 — Contraste do texto coral pequeno

Evidências: imagens 01, 03 e 08; `TaskCard.tsx`, tokens e erros do formulário.
Coral `#E6674D` sobre papel tem contraste aproximado de **3,00:1**. No fundo
composto do chip de disciplina atrasada (`#FCEBE8`), aproximadamente **2,84:1**.
São textos pequenos; a referência de contraste mínimo AA é **4,5:1** para texto
normal. [Referência W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Usar tinta para a informação e reservar coral para o ícone/borda, ou definir
uma cor de texto de erro mais escura. Preservar o papel e o acento da marca.
Comandos adequados: `$impeccable colorize`, depois `$impeccable polish`.

### 2. P2 — A abertura demora a chegar às tarefas e o radar perde o sentido no fim

Evidências: imagens 01, 11 e 13. Na primeira dobra de 412 px, a primeira
atividade começa por volta da metade da tela. Em 360 px, a segunda já fica
cortada. Quando todas estão concluídas, o radar continua chamando tarefas
riscadas de "Prioridades imediatas do semestre".

Compactar a abertura/progresso sem perder a assinatura editorial. Fazer o
estado 100% refletir ausência de pendências, mantendo histórico em Atividades.
Comandos: `$impeccable layout`, `$impeccable clarify`.

### 3. P2 — Cartões extensos e repetitivos reduzem leitura rápida

Evidências: imagens 03–05. Cada atividade mostra chip, lixeira, checkbox,
título, duas linhas de descrição e prazo. Na lista cabem poucas atividades;
as superfícies têm quase o mesmo peso visual. Concluídas ficam muito atenuadas.

Criar uma apresentação mais compacta para a lista, dar maior prioridade a
título e prazo e reservar detalhes para edição. Reavaliar a lixeira repetida,
pois a edição já tem exclusão com confirmação. Preservar acesso ao CRUD.
Comandos: `$impeccable distill`, `$impeccable layout`.

### 4. P2 — Formulário gasta altura com opções e a ação principal fica no fluxo

Evidências: imagens 06–09 e 14; `app/task-form.tsx`. As seis sugestões de
disciplina se espalham por várias linhas antes do prazo. A data combina rótulo
amigável com ISO (`Amanhã (2026-11-08)`). O botão salvar está dentro do conteúdo
rolável; o briefing previa ação fixa acima do teclado.

Compactar as sugestões preservando sua utilidade, apresentar a data em
português e definir posição persistente para salvar. Conferir esse último
ponto com teclado real no Android antes de considerá-lo resolvido.
Comandos: `$impeccable distill`, `$impeccable adapt`.

### 5. P2 — A identidade editorial ainda se concentra em cores e título

Evidências: imagens 01, 03 e 06. O conceito de caderno aparece pouco na
composição; há muitos rótulos em caixa alta, cápsulas e cartões convencionais.
Inputs usam `fontSize` sem `fontFamily`, criando outra voz tipográfica.

Preservar a paleta e as fontes escolhidas. Trabalhar ritmo editorial,
proporção entre blocos e poucos detalhes de marca consistentes. Unificar a
tipografia dos inputs com o corpo e reduzir tratamentos redundantes. Isso
depende da direção visual que o usuário preferir, antes de qualquer implementação.
Comandos: `$impeccable typeset`, `$impeccable bolder` ou `$impeccable distill`,
conforme a direção escolhida; finalizar com `$impeccable polish`.

## Carga cognitiva e jornada

Carga moderada: excesso de elementos por cartão, várias sugestões sempre
abertas e pouca revelação gradual de detalhes. O agrupamento dos campos e os
atalhos ajudam; devem ser preservados ao compactar a interface.

A abertura é acolhedora; a lista vira uma sequência repetitiva; o formulário
ganha aspecto burocrático. No fechamento do ciclo, 100% concluído merece um
estado coerente, em vez de continuar pedindo atenção para tarefas já feitas.

## Perfis considerados

- Primeiro uso: "Nova" é curto e a edição pelo bloco textual tem pouca pista
  visual. Tornar o próximo passo inequívoco sem multiplicar botões.
- Uso com uma mão: criação no topo direito e longas listas exigem alcance e
  rolagem. O posicionamento de salvar precisa de validação com teclado Android.
- Baixa visão: texto coral pequeno e atenuação dos concluídos merecem atenção.
  Não foi feito teste de TalkBack ou fonte ampliada no aparelho.

## Observações menores e limites

- Os filtros horizontais de disciplina cortam o próximo item; vale tornar mais
  evidente que a faixa desliza. Não é perda de conteúdo, pois há rolagem.
- O coral também aparece em erros de armazenamento/formulário, enquanto o
  briefing original o reservava para atraso; revisar a semântica da paleta.
- O rodapé "Restaurar dados da demo" das capturas não existe no APK release.
- Não avaliei fluidez, haptics, teclado ou barras de sistema com essas imagens.
- Nenhuma tela ou token do aplicativo foi alterado nesta revisão.

## Diretrizes para a próxima etapa

1. Preferência de direção: editorial atual mais refinado, campus mais expressivo
   ou visual mais minimalista/compacto?
2. Prioridade: abertura e cartões, formulário ou revisão coordenada das três telas?

Pode indicar números das imagens, o que deve mudar e o que deve ser preservado.
