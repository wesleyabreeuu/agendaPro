-- Objetivo: Pedal Peregrinação Valença -> Aparecida
-- Ajuste o @user_id antes de executar, caso seu usuário não seja o ID 1.
-- Exemplo para descobrir: SELECT id, name, email FROM usuarios;

SET @user_id = 1;
SET @goal_title = 'Pedal Peregrinação Valença → Aparecida';

INSERT INTO goals (
    user_id,
    titulo,
    descricao,
    categoria,
    data_inicio,
    data_meta,
    status,
    cor,
    icone,
    peso_inicial,
    peso_meta,
    distancia_meta,
    valor_meta,
    tipo_meta,
    created_at,
    updated_at
)
SELECT
    @user_id,
    @goal_title,
    'Realizar uma peregrinação ciclística saindo de Valença/RJ até Aparecida/SP em um único dia, desenvolvendo condicionamento físico, resistência, disciplina, fortalecimento muscular e hábitos saudáveis.\n\nCada treino me aproxima de Aparecida. Cada quilômetro percorrido fortalece meu corpo, minha mente e minha fé. Esta peregrinação é uma oferta de gratidão por minha família, especialmente pela Laurinha, e um compromisso com uma vida mais saudável.',
    'Saúde e Esporte',
    '2026-07-01',
    '2026-12-20',
    'em_andamento',
    '#2563eb',
    '🚲',
    110,
    95,
    250,
    250,
    'distancia',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM goals WHERE user_id = @user_id AND titulo = @goal_title
);

SET @goal_id = (
    SELECT id FROM goals WHERE user_id = @user_id AND titulo = @goal_title ORDER BY id DESC LIMIT 1
);

DELETE FROM goal_milestones WHERE goal_id = @goal_id;

INSERT INTO goal_milestones (
    goal_id,
    titulo,
    descricao,
    ordem,
    meta_valor,
    concluido,
    concluido_em,
    created_at,
    updated_at
) VALUES
(@goal_id, 'Primeiro Longão 50 km', 'Tipo: Distância\nPrazo: 31/07/2026', 1, 50, 0, NULL, NOW(), NOW()),
(@goal_id, 'Primeiro Longão 80 km', 'Tipo: Distância\nPrazo: 31/08/2026', 2, 80, 0, NULL, NOW(), NOW()),
(@goal_id, 'Primeiro Pedal 100 km', 'Tipo: Distância\nPrazo: 30/09/2026', 3, 100, 0, NULL, NOW(), NOW()),
(@goal_id, 'Primeiro Pedal 150 km', 'Tipo: Distância\nPrazo: 31/10/2026', 4, 150, 0, NULL, NOW(), NOW()),
(@goal_id, 'Primeiro Pedal 200 km', 'Tipo: Distância\nPrazo: 30/11/2026', 5, 200, 0, NULL, NOW(), NOW()),
(@goal_id, 'Chegar aos 100 kg', 'Tipo: Peso\nPrazo: 31/10/2026', 6, 100, 0, NULL, NOW(), NOW()),
(@goal_id, 'Chegar aos 95 kg', 'Tipo: Peso\nPrazo: 15/12/2026', 7, 95, 0, NULL, NOW(), NOW()),
(@goal_id, 'Peregrinação Valença → Aparecida', 'Tipo: Distância\nPrazo: 20/12/2026', 8, 250, 0, NULL, NOW(), NOW());

INSERT INTO goal_progress (
    goal_id,
    data,
    descricao,
    valor,
    tipo,
    observacoes,
    created_at,
    updated_at
) VALUES
(@goal_id, '2026-07-01', 'Peso inicial', 110, 'peso', 'Registro inicial do objetivo.', NOW(), NOW()),
(@goal_id, '2026-07-01', 'Distância atual', 40, 'distancia', 'Maior pedal atual informado no planejamento.', NOW(), NOW()),
(@goal_id, '2026-07-01', 'Meta intermediária de peso', 100, 'peso', 'Meta intermediária: chegar aos 100 kg.', NOW(), NOW()),
(@goal_id, '2026-07-01', 'Meta de treinos semanais', 4, 'treino', 'Objetivo: 4 treinos por semana.', NOW(), NOW()),
(@goal_id, '2026-07-01', 'Meta mensal de treinos', 16, 'treino', 'Objetivo: 16 treinos por mês.', NOW(), NOW());

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Pedalar Terça-feira', 'Treino semanal de pedal vinculado ao objetivo Valença -> Aparecida. Meta: 1x por semana.', 'saude', 'dias_semana', JSON_ARRAY('ter'), NULL, '2026-07-01', NULL, 'media', 'alta', 1, 'Pedal leve de manutenção ou rolo por 30 minutos.', '#2563eb', '🚲', 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Pedalar Terça-feira');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Pedalar Quarta-feira', 'Treino semanal de pedal vinculado ao objetivo Valença -> Aparecida. Meta: 1x por semana.', 'saude', 'dias_semana', JSON_ARRAY('qua'), NULL, '2026-07-01', NULL, 'media', 'alta', 1, 'Pedal leve de manutenção ou rolo por 30 minutos.', '#2563eb', '🚲', 1, 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Pedalar Quarta-feira');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Pedalar Sexta-feira', 'Treino semanal de pedal vinculado ao objetivo Valença -> Aparecida. Meta: 1x por semana.', 'saude', 'dias_semana', JSON_ARRAY('sex'), NULL, '2026-07-01', NULL, 'media', 'alta', 1, 'Pedal leve de manutenção ou rolo por 30 minutos.', '#2563eb', '🚲', 1, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Pedalar Sexta-feira');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Longão de Sábado', 'Treino longo semanal. Meta: 1x por semana.', 'saude', 'dias_semana', JSON_ARRAY('sab'), NULL, '2026-07-01', NULL, 'dificil', 'alta', 1, 'Longão reduzido, mantendo o compromisso sem exagerar.', '#1d4ed8', '🚲', 1, 4, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Longão de Sábado');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Fortalecimento Muscular', 'Fortalecimento para pernas, core e prevenção de lesões. Meta: 2x por semana ou 8x por mês.', 'saude', 'dias_semana', JSON_ARRAY('seg', 'qui'), NULL, '2026-07-01', NULL, 'media', 'media', 1, 'Série curta de 15 minutos.', '#16a34a', '💪', 1, 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Fortalecimento Muscular');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Consumir 2 Frutas', 'Hábito alimentar diário. Meta: 2 vezes ao dia.', 'saude', 'diaria', NULL, NULL, '2026-07-01', NULL, 'facil', 'baixa', 1, 'Consumir ao menos 1 fruta no dia.', '#f59e0b', '🍎', 1, 6, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Consumir 2 Frutas');

INSERT INTO rotinas (user_id, nome, descricao, categoria, frequencia_tipo, dias_semana, intervalo_dias, data_inicio, horario, dificuldade, energia_recomendada, modo_minimo_ativo, modo_minimo_descricao, cor, icone, ativo, ordem, created_at, updated_at)
SELECT @user_id, 'Beber 3 Litros de Água', 'Hidratação diária. Meta: 3 litros.', 'saude', 'diaria', NULL, NULL, '2026-07-01', NULL, 'facil', 'baixa', 1, 'Beber ao menos 1,5 litro no dia.', '#0ea5e9', '💧', 1, 7, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM rotinas WHERE user_id = @user_id AND nome = 'Beber 3 Litros de Água');

INSERT IGNORE INTO goal_rotina (goal_id, rotina_id, created_at, updated_at)
SELECT @goal_id, id, NOW(), NOW()
FROM rotinas
WHERE user_id = @user_id
  AND nome IN (
    'Pedalar Terça-feira',
    'Pedalar Quarta-feira',
    'Pedalar Sexta-feira',
    'Longão de Sábado',
    'Fortalecimento Muscular',
    'Consumir 2 Frutas',
    'Beber 3 Litros de Água'
  );

SELECT
    g.id AS goal_id,
    g.titulo,
    g.status,
    g.data_inicio,
    g.data_meta,
    COUNT(DISTINCT gm.id) AS marcos,
    COUNT(DISTINCT gr.rotina_id) AS rotinas_vinculadas
FROM goals g
LEFT JOIN goal_milestones gm ON gm.goal_id = g.id
LEFT JOIN goal_rotina gr ON gr.goal_id = g.id
WHERE g.id = @goal_id
GROUP BY g.id, g.titulo, g.status, g.data_inicio, g.data_meta;
