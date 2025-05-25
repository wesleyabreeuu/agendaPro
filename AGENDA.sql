

CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);


CREATE TABLE categorias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);


CREATE TABLE compromissos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuarios_id BIGINT UNSIGNED NOT NULL,
    categoria_id BIGINT UNSIGNED NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NULL,
    dia_inteiro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_compromissos_usuarios FOREIGN KEY (usuarios_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_compromissos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);


CREATE TABLE lembretes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    compromisso_id BIGINT UNSIGNED NOT NULL,
    minutos_antes INT NOT NULL, -- Ex: 30 = 30 minutos antes
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_lembretes_compromisso FOREIGN KEY (compromisso_id) REFERENCES compromissos(id) ON DELETE CASCADE
);
