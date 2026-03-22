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
