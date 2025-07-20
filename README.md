# 📅 AgendaPro

**AgendaPro** é um sistema completo de agendamento e organização de compromissos e tarefas, desenvolvido em Laravel com interface baseada em AdminLTE. Ele foi pensado para uso pessoal, familiar ou para pequenos negócios que desejam ter controle eficiente e digitalizado de sua agenda.

---

## 🚀 Funcionalidades principais
- Cadastro e gestão de compromissos
- Lembretes automáticos
- Controle de tarefas (ToDo list)
- Compromissos recorrentes
- Integração com API WhatsApp (em desenvolvimento)
- Interface intuitiva e responsiva

---

## ⚙️ Tecnologias utilizadas
- **Backend:** PHP 8+, Laravel
- **Frontend:** Blade, AdminLTE, Bootstrap
- **Banco de dados:** MySQL
- **Containerização:** Docker + Docker Compose
- **AJAX:** Atualizações dinâmicas e carregamento assíncrono
- **Outros:** Integração com APIs externas (ex.: WhatsApp)

---

## 💻 Como executar localmente

1️⃣ Clone o repositório:
```bash
git clone https://github.com/wesleyabreeuu/agendaPro.git

2️⃣ Acesse o diretório do projeto:

bash
cd agendaPro

3️⃣ Suba os containers Docker:

bash
docker-compose up -d --build

4️⃣ Instale as dependências:

bash
composer install
npm install && npm run dev

5️⃣ Configure o .env:

bash
cp .env.example .env
php artisan key:generate

6️⃣ Rode as migrations:
bash
php artisan migrate
