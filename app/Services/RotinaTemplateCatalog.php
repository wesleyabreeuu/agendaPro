<?php

namespace App\Services;

use App\Models\RotinaTemplate;

class RotinaTemplateCatalog
{
    public function ensureDefaults(): void
    {
        foreach ($this->defaults() as $template) {
            RotinaTemplate::updateOrCreate(
                ['nome' => $template['nome']],
                $template
            );
        }
    }

    public function defaults(): array
    {
        return [
            [
                'nome' => 'Rotina da manhã produtiva',
                'descricao' => 'Uma abertura de dia simples para sair do automático e entrar em ritmo de execução.',
                'categoria' => 'pessoal',
                'ativo' => true,
                'rotinas' => [
                    ['nome' => 'Acordar no horário', 'descricao' => 'Evitar soneca e começar o dia com intenção.', 'categoria' => 'pessoal', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'media', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Levantar da cama assim que despertar.'],
                    ['nome' => 'Arrumar a cama', 'descricao' => 'Criar sensação de ordem logo cedo.', 'categoria' => 'pessoal', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Organizar apenas travesseiro e coberta.'],
                    ['nome' => 'Planejar o dia', 'descricao' => 'Definir as prioridades antes de começar.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'media', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Anotar uma prioridade principal.'],
                    ['nome' => 'Ler por 10 minutos', 'descricao' => 'Alimentar a mente antes das distrações.', 'categoria' => 'estudos', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Ler por 2 minutos.'],
                ],
            ],
            [
                'nome' => 'Rotina espiritual diária',
                'descricao' => 'Pequenos rituais para manter presença, fé e gratidão no cotidiano.',
                'categoria' => 'espiritual',
                'ativo' => true,
                'rotinas' => [
                    ['nome' => 'Oração', 'descricao' => 'Separar um momento de conexão espiritual.', 'categoria' => 'espiritual', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Fazer uma oração breve de 2 minutos.'],
                    ['nome' => 'Leitura bíblica', 'descricao' => 'Ler um trecho curto e refletir.', 'categoria' => 'espiritual', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Ler apenas um versículo.'],
                    ['nome' => 'Momento de gratidão', 'descricao' => 'Registrar ou mentalizar três motivos de gratidão.', 'categoria' => 'espiritual', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Pensar em um motivo de gratidão.'],
                ],
            ],
            [
                'nome' => 'Rotina anti-procrastinação',
                'descricao' => 'Uma sequência curta para sair da paralisia e gerar tração no dia.',
                'categoria' => 'trabalho',
                'ativo' => true,
                'rotinas' => [
                    ['nome' => 'Definir 3 prioridades do dia', 'descricao' => 'Tornar o foco visível.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'media', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Definir apenas 1 prioridade.'],
                    ['nome' => 'Fazer 1 tarefa importante sem distração', 'descricao' => 'Entrar em execução profunda por um bloco curto.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'dificil', 'energia_recomendada' => 'alta', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Focar por 5 minutos na tarefa mais importante.'],
                    ['nome' => 'Revisar progresso do dia', 'descricao' => 'Fechar o expediente com clareza do que avançou.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Anotar um pequeno avanço do dia.'],
                ],
            ],
            [
                'nome' => 'Rotina de saúde básica',
                'descricao' => 'Base simples para cuidar do corpo mesmo em semanas corridas.',
                'categoria' => 'saude',
                'ativo' => true,
                'rotinas' => [
                    ['nome' => 'Beber água', 'descricao' => 'Manter hidratação consciente ao longo do dia.', 'categoria' => 'saude', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Beber pelo menos um copo de água.'],
                    ['nome' => 'Caminhar', 'descricao' => 'Movimentar o corpo e quebrar o sedentarismo.', 'categoria' => 'saude', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'media', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Caminhar por 5 minutos.'],
                    ['nome' => 'Alongar', 'descricao' => 'Dar atenção ao corpo e reduzir rigidez.', 'categoria' => 'saude', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Fazer um alongamento curto de 2 minutos.'],
                    ['nome' => 'Dormir em horário adequado', 'descricao' => 'Encerrar o dia com disciplina de descanso.', 'categoria' => 'saude', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Desligar telas 10 minutos antes de dormir.'],
                ],
            ],
            [
                'nome' => 'Rotina para quem trabalha o dia todo',
                'descricao' => 'Pequenos marcos que mantêm o dia alinhado sem exigir blocos longos.',
                'categoria' => 'trabalho',
                'ativo' => true,
                'rotinas' => [
                    ['nome' => 'Planejar manhã', 'descricao' => 'Visualizar o essencial antes da correria.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'media', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Anotar a principal prioridade do dia.'],
                    ['nome' => 'Pausa consciente', 'descricao' => 'Fazer uma pausa curta sem tela para recuperar foco.', 'categoria' => 'saude', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'facil', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Respirar fundo por 1 minuto.'],
                    ['nome' => 'Revisar pendências', 'descricao' => 'Checar o que ficou aberto no fim do expediente.', 'categoria' => 'trabalho', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Registrar apenas a próxima ação.'],
                    ['nome' => 'Desligamento mental à noite', 'descricao' => 'Encerrar o dia com um gesto de transição.', 'categoria' => 'pessoal', 'frequencia_tipo' => 'diaria', 'dificuldade' => 'media', 'energia_recomendada' => 'baixa', 'modo_minimo_ativo' => true, 'modo_minimo_descricao' => 'Ficar 5 minutos longe do celular antes de dormir.'],
                ],
            ],
        ];
    }
}
