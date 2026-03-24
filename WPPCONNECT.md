# WPPConnect persistente

Esta aplicacao usa uma sessao fixa do WPPConnect para envio de mensagens pelo Laravel.

## Configuracao padrao

Defina as mesmas variaveis no `.env` local e na producao:

```env
WPP_BASE_URL=http://wppconnect:21465
WPP_SESSION=agendapro
WPP_TOKEN=agendapro123
WPP_SECRET_KEY=agendapro123
WPP_PORT=21465
```

Importante:

- `WPP_SESSION` deve continuar o mesmo entre reinicios e deploys.
- `WPP_TOKEN` e `WPP_SECRET_KEY` devem continuar os mesmos para evitar quebra de autenticacao.
- O QR Code so deve ser lido de novo apenas se a sessao do WhatsApp for perdida de fato.

## Persistencia da sessao

O `docker-compose.yml` agora persiste separadamente em volumes nomeados do Docker:

- `wppconnect-tokens`
- `wppconnect-user-data`

Esses volumes precisam permanecer no servidor entre reinicios e novas recriacoes do container.

O servidor tambem usa [wppconnect.config.json](/home/esley/projetos/agenda/wppconnect.config.json) com `createOptions.autoClose = 0`, para o QR Code nao ser fechado automaticamente antes da leitura.
Na imagem `wppconnect/server-cli:latest`, esses volumes sao montados em:

- `/usr/src/wpp-server/tokens`
- `/usr/src/wpp-server/userDataDir`

Tambem montamos uma correcao local para a rota de envio em [wppconnect-server/dist/controller/messageController.js](/home/esley/projetos/agenda/wppconnect-server/dist/controller/messageController.js), porque a implementacao original da imagem iterava o campo `phone` como string e podia falhar em numeros validos.

## Primeira subida

Suba o servico:

```bash
docker compose up -d wppconnect
```

Depois conecte a sessao `WPP_SESSION` uma unica vez lendo o QR Code.

## Reinicios e deploys

Para manter a mesma sessao:

```bash
docker compose up -d --force-recreate wppconnect
```

Nao rode `docker compose down -v`, porque isso remove os volumes e obriga novo QR Code.

## O que evitar

- Nao trocar `WPP_SESSION` sem necessidade.
- Nao trocar `WPP_TOKEN` ou `WPP_SECRET_KEY` em todo deploy.
- Nao remover os volumes `wppconnect-tokens` e `wppconnect-user-data`.
- Nao chamar rotas de fechamento de sessao sem necessidade.

## Observacao importante

A sessao fica estavel entre reinicios e deploys quando os volumes sao mantidos. Mesmo assim, o proprio WhatsApp pode invalidar a conexao em alguns cenarios, como logout manual, desvinculacao no celular ou mudancas de seguranca da conta.
