# Roteiro de demo de 5 minutos

## Preparar e apresentar

- Inicie `npx expo start` e abra a versão disponível. No ambiente desta entrega,
  os fluxos foram executados no navegador. O APK já está disponível; instalação
  e execução Android permanecem pendentes por ausência de aparelho/emulador.
- Se estiver reapresentando, use "Restaurar dados da demo" no build de
  desenvolvimento, confirmando a substituição dos dados. Esse controle não
  aparece no APK release. Não limpe dados pessoais para montar uma demo.
- 0:00–1:00: apresente a identidade, o radar e o progresso inicial.
- 1:00–2:00: alterne Pendentes/Concluídas e conclua uma atividade.
- 2:00–3:00: cadastre a atividade da apresentação com prazo amanhã.
- 3:00–4:00: edite descrição/prazo e demonstre cancelar/confirmar exclusão.
- 4:00–5:00: feche/reabra, confira a persistência e explique os limites.

Para o APK real, faça este roteiro também sem rede e sem Metro. Não apresente
um bundle JavaScript exportado como se fosse um APK instalável.

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
