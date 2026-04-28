# API Surface Map

Data: 2026-04-28

## Objetivo

Inventariar as rotas que expõem dados do AgendaPro e registrar as proteções aplicadas para reduzir risco de vazamento, indexação, cache indevido e abuso.

## Rotas API autenticadas

### Dashboard e IA

| Método | URI | Controller | Proteção |
| --- | --- | --- | --- |
| GET | `/api/dashboard` | `Api\DashboardController@index` | `auth`, `throttle:api-authenticated`, headers `secure.api` |
| POST | `/api/ai/command` | `Api\AIController@handle` | `auth`, `throttle:api-authenticated`, `throttle:ai-commands`, headers `secure.api` |

### Compromissos compartilhados

| Método | URI | Controller | Proteção |
| --- | --- | --- | --- |
| GET | `/api/compromissos/compartilhados` | `Api\CompromissoCompartilhamentoController@index` | `auth`, `can:access-compromissos`, `throttle:api-authenticated`, headers `secure.api` |
| GET | `/api/compromissos/{compromisso}` | `Api\CompromissoCompartilhamentoController@show` | `auth`, `can:access-compromissos`, policy `view`, headers `secure.api` |
| PUT | `/api/compromissos/{compromisso}` | `Api\CompromissoCompartilhamentoController@update` | `auth`, `can:access-compromissos`, policy `update`, headers `secure.api` |
| POST | `/api/compromissos/{compromisso}/compartilhar` | `Api\CompromissoCompartilhamentoController@store` | `auth`, `can:access-compromissos`, policy `share`, headers `secure.api` |
| DELETE | `/api/compromissos/{compromisso}/compartilhar/{usuario}` | `Api\CompromissoCompartilhamentoController@destroy` | `auth`, `can:access-compromissos`, policy `share`, headers `secure.api` |

### Hábitos

| Método | URI | Controller | Proteção |
| --- | --- | --- | --- |
| GET | `/api/habitos` | `Api\HabitoController@index` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |
| POST | `/api/habitos` | `Api\HabitoController@store` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |
| GET | `/api/habitos/{habito}` | `Api\HabitoController@show` | `auth`, `can:access-dia-a-dia`, policy `view`, headers `secure.api` |
| PUT | `/api/habitos/{habito}` | `Api\HabitoController@update` | `auth`, `can:access-dia-a-dia`, policy `update`, headers `secure.api` |
| DELETE | `/api/habitos/{habito}` | `Api\HabitoController@destroy` | `auth`, `can:access-dia-a-dia`, policy `delete`, headers `secure.api` |
| POST | `/api/habitos/{habito}/concluir` | `Api\HabitoLogController@store` | `auth`, `can:access-dia-a-dia`, policy `markComplete`, headers `secure.api` |
| GET | `/api/habitos/{habito}/estatisticas` | `Api\HabitoController@stats` | `auth`, `can:access-dia-a-dia`, policy `view`, headers `secure.api` |

### Meu Dia

| Método | URI | Controller | Proteção |
| --- | --- | --- | --- |
| GET | `/api/meu-dia` | `MeuDiaController@index` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |
| POST | `/api/meu-dia/action` | `MeuDiaController@action` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |
| GET | `/api/daily-session/check` | `DailySessionController@check` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |
| POST | `/api/daily-session/start` | `DailySessionController@start` | `auth`, `can:access-dia-a-dia`, `throttle:api-authenticated`, headers `secure.api` |

## Endpoints JSON/feed fora de `/api`

| Método | URI | Controller | Proteção |
| --- | --- | --- | --- |
| GET | `/compromissos/calendario/eventos` | `CompromissoController@calendarioEventos` | `auth`, `can:access-compromissos`, `throttle:data-feeds`, headers `secure.api` |
| GET | `/lembretes/due/feed` | `LembreteController@due` | `auth`, `can:access-compromissos`, `throttle:data-feeds`, headers `secure.api` |
| POST | `/push-subscriptions` | `PushSubscriptionController@store` | `auth`, `can:access-compromissos`, `throttle:data-feeds`, headers `secure.api` |
| DELETE | `/push-subscriptions` | `PushSubscriptionController@destroy` | `auth`, `can:access-compromissos`, `throttle:data-feeds`, headers `secure.api` |

## Endpoints públicos técnicos

| Método | URI | Controller | Observação |
| --- | --- | --- | --- |
| GET | `/integracoes/strava/webhook` | `StravaController@webhookVerify` | Público por exigência da integração; validado por token do Strava |
| POST | `/integracoes/strava/webhook` | `StravaController@webhook` | Público por exigência da integração; payload validado e sem retorno de dados internos |
| GET | `/up` | Laravel health endpoint | Não expõe dados de domínio |

## Medidas aplicadas

- Middleware `secure.api` com `Cache-Control: no-store`, `Pragma: no-cache`, `X-Robots-Tag: noindex`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` e `Referrer-Policy: same-origin`.
- Rate limiting para APIs autenticadas, comandos de IA e feeds de dados.
- Minimização de payload em compromissos compartilhados:
  - remoção de e-mails diretos do owner em respostas
  - mascaramento de e-mails de usuários compartilhados
  - telefone exposto apenas ao owner
  - lista de compartilhamento exposta apenas ao owner

## Próximos candidatos a endurecimento

- Padronizar DTO/Resource classes para respostas JSON.
- Adicionar testes de autorização para todos os endpoints com route-model binding.
- Revisar o endpoint público `storage/{path}` conforme política de arquivos do produto.
