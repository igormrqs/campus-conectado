# Roteiro de demo de 5 minutos

## Dados iniciais simulados
Criar 10–12 atividades com prazo relativo ao primeiro acesso (hoje, amanhã, +3 dias, +7 dias, -1 dia), distribuídas em disciplinas como Estruturas de Dados, Banco de Dados, Engenharia de Software, Cálculo, Redes de Computadores e Desenvolvimento Mobile. Misturar concluídas, pendentes e uma atrasada.

Exemplos de títulos:
- Revisar árvores binárias
- Entregar DER do projeto
- Preparar apresentação de UX
- Resolver lista de integrais
- Estudar protocolos de rede
- Finalizar telas do MVP

Salve seed apenas na primeira execução; depois respeite alterações do usuário. Disponibilize `resetDemo()` para reapresentação controlada, oculto em menu de desenvolvimento.

## Fluxo da apresentação
1. Mostrar a Home: destaque editorial, tarefas do dia e indicador de progresso atualizado.
2. Abrir Atividades e alternar filtro Pendentes/Concluídas.
3. Concluir uma tarefa; verificar microanimação, haptics e atualização dos totais.
4. Criar tarefa "Apresentar Campus Conectado" em "Desenvolvimento Mobile" com prazo amanhã.
5. Editar descrição/prazo; depois excluir outra atividade com confirmação.
6. Fechar/reabrir e demonstrar que as alterações foram preservadas localmente.
7. Mostrar README e testes; explicar que o conteúdo inicial é simulado, mas as interações e o salvamento são reais.

## Verificações rápidas
- Título vazio mostra erro sem travar.
- Campos não escapam do teclado; botão salvar permanece acessível.
- Status visual, textos longos e tela vazia se comportam bem.
- Não há botões sem ação e não depende de conexão à internet.
