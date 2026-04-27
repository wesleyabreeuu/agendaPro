# AgendaPro

AgendaPro e um sistema de organizacao pessoal com compromissos, lembretes, tarefas, financeiro, saude e integracoes externas.

## Funcionalidades
- Compromissos e calendario
- Lembretes
- ToDo
- Kanban
- Controle financeiro
- Saude e fitness
- Integracao com WhatsApp
- Integracao com Strava para importar atividades automaticamente

## Stack
- PHP 8.2+
- Laravel 12
- Blade + AdminLTE
- MySQL
- Docker + Sail

## Execucao local
1. Instale as dependencias:
```bash
composer install
npm install
```

2. Configure o ambiente:
```bash
cp .env.example .env
php artisan key:generate
```

3. Suba os containers:
```bash
./vendor/bin/sail up -d
```

4. Rode as migrations:
```bash
./vendor/bin/sail artisan migrate
```

## Web Push no PWA
Para que as notificacoes cheguem mesmo com o sistema fechado, o navegador/PWA precisa estar inscrito em Web Push e o servidor precisa executar o agendador do Laravel continuamente.

### Variaveis de ambiente
Adicione no `.env`:

```env
WEBPUSH_SUBJECT=mailto:suporte@seu-dominio.com
WEBPUSH_PUBLIC_KEY=
WEBPUSH_PRIVATE_KEY=
```

Para gerar as chaves VAPID:

```bash
./vendor/bin/sail artisan webpush:vapid
```

### Requisitos
- O site precisa estar em HTTPS em producao.
- O usuario precisa permitir notificacoes do site.
- No iPhone/iPad, o Web Push exige que o app seja instalado na tela inicial como PWA.
- O scheduler do Laravel precisa estar rodando para disparar `reminders:push-due`.

## Integracao com Strava
Essa integracao permite conectar a conta do usuario ao Strava e importar automaticamente atividades novas para o modulo de saude.

### Variaveis de ambiente
Adicione no `.env`:

```env
APP_URL=https://systemagendapro.com.br

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_VERIFY_TOKEN=strava_agendapro_2026
STRAVA_WEBHOOK_CALLBACK_URL=https://systemagendapro.com.br/integracoes/strava/webhook
```

### Configuracao no Strava
No app criado em `https://www.strava.com/settings/api`, use:

- Authorization Callback Domain: `systemagendapro.com.br`
- Callback OAuth efetiva: `https://systemagendapro.com.br/integracoes/strava/callback`
- Webhook: `https://systemagendapro.com.br/integracoes/strava/webhook`

### Passos de deploy em producao
1. Gere um novo `client secret` no Strava se o atual ja tiver sido exposto.
2. Publique o codigo em producao.
3. Atualize o `.env` com as variaveis do Strava.
4. Rode:

```bash
php artisan config:clear
php artisan migrate
php artisan strava:webhook:subscribe
```

### Observacoes importantes
- O webhook do Strava exige URL publica com HTTPS.
- O botao de conectar/desconectar Strava aparece no dashboard de Saude.
- Atividades importadas recebem origem `Strava` para evitar duplicidade.

## Assistente de IA
O backend expõe o endpoint `POST /api/ai/command` para interpretar comandos em linguagem natural e executar apenas acoes permitidas no sistema.

### Variaveis de ambiente
Adicione no `.env`:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT=30
```

### Requisicao
Envie um JSON autenticado com o campo `command`:

```json
{
  "command": "cria um compromisso amanha as 14h com Joao"
}
```

### Resposta de sucesso
```json
{
  "message": "Acao executada com sucesso",
  "action": "create_event",
  "data": {
    "id": 123,
    "title": "Compromisso com Joao",
    "description": null,
    "date": "2026-04-12",
    "time": "14:00",
    "all_day": false
  }
}
```

### Fallback quando a IA nao entender
```json
{
  "message": "Nao entendi o comando. Pode reformular?",
  "action": "unknown",
  "data": {}
}
```

### Acoes permitidas
- `create_event`
- `create_reminder`
- `create_expense`
- `create_income`
- `create_income_goal`
- `create_asset_goal`
- `create_task`
- `list_events_today`

### Regras de seguranca
- A IA nao executa nada diretamente.
- O backend valida a action com whitelist.
- O backend rejeita campos extras retornados pela IA.
- O backend valida os dados por action antes de persistir.
- O backend respeita o acesso do usuario aos modulos `compromissos`, `dia_a_dia` e `financeiro`.

### Testes
Para validar a integracao:

```bash
php artisan test --filter=AICommandApiTest
```
