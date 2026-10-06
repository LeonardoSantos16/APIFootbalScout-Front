---
status: accepted
---

# Tokens de sessao no localStorage

O access token (15 min) e o refresh token (7 dias) ficam no `localStorage`. A alternativa mais segura, access token so em memoria e refresh em cookie `httpOnly`, exige mudar o back-end, que hoje recebe e devolve o refresh token no corpo de `/api/Auth/refresh` e `signout`. Para um projeto de portfolio, a simplicidade e a sessao sobrevivendo ao reload pesam mais que a exposicao a XSS.

## Consequencias

- Qualquer XSS le os dois tokens. Isso proibe `dangerouslySetInnerHTML` com dado externo (o payload do SofaScore inclusive) e scripts de terceiros fora de CDN conhecida.
- O `localStorage` e compartilhado entre abas, e o refresh rotaciona o token: duas abas renovando juntas derrubam a sessao. A coordenacao esta no [ADR 0002](0002-refresh-unico-com-fila.md).
- O boot chama `GET /api/Auth/me` para confirmar que o token salvo ainda vale.
- Toda leitura e escrita de token passa por um unico modulo, para que a migracao para cookie `httpOnly` troque so esse modulo. A migracao depende do back-end aceitar o refresh pelo cookie.
