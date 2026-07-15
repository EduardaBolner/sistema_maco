-- Adiciona a tabela de usuarios para autenticacao real

CREATE TABLE usuario (
    id_usuario   SERIAL PRIMARY KEY,
    nm_usuario   VARCHAR(150) NOT NULL,
    login        VARCHAR(60) NOT NULL UNIQUE,
    senha_hash   VARCHAR(100) NOT NULL,
    dt_criacao   TIMESTAMP NOT NULL DEFAULT now()
);
