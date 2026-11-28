# TargetRow

Linha de um alvo na shortlist: prioridade, jogador, custo estimado e as ações de repriorizar e remover.

- **O consumidor fornece:** `priority`, `cost` já formatado ("€12,5M"), `fallbackName` ("Jogador #1009"), e do perfil em cache `name`, `detail` (posição e clube), `photo` (um `PlayerPhoto` pequeno) e `href`; `loading` enquanto o perfil chega; `error` e `onRetry` quando o perfil falha (`onRetry` só no 502); `pending` com a frase do estado ("Movendo para a prioridade 1…", "Removendo…"); `dragging`; `disabled` para travar a lista inteira; `canMoveUp`, `canMoveDown`, `onMoveUp`, `onMoveDown`, `onRemove`; e `handleProps`, espalhado na alça para a biblioteca de arrastar.
- Prioridade, custo e ações não dependem do perfil: valem com o perfil carregando ou com erro. Sem perfil, o nome é o `fallbackName` em `ink-soft`, sem link.
- As ações são botões de ícone com `aria-label` ("Subir Rafael Montes"): alça `dots-six-vertical`, `arrow-up`, `arrow-down` e `x`. Com `pending` ou `disabled`, todas ficam desabilitadas. Subir desabilitado na prioridade 1 e Descer na última.
- Pendente: prioridade, nome e custo em `ink-muted`, a foto atenuada e a frase em `role="status"` no lugar da linha de apoio. O número só muda quando a resposta chega.
- Arrastando: `surface-raised` com o contorno de foco em `pitch`, sem sombra.
- Abaixo de 720px: as ações descem para uma segunda linha com texto ("Subir", "Descer", "Remover"), a alça some e a ação que não se aplica some em vez de ficar desabilitada. O rótulo "Custo estimado" fica só para leitor de tela.
- O componente não ordena nem anima: a lista vem do servidor e a página desliza as linhas em 150ms.
