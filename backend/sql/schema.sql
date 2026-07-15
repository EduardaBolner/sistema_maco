-- Sistema de Cadastros - Grande Loja Regular do Rio Grande do Sul
-- Schema relacional conforme ER fornecido pelo cliente

CREATE TABLE pais (
    id_pais     SERIAL PRIMARY KEY,
    ds_pais     VARCHAR(120) NOT NULL
);

CREATE TABLE estado (
    id_estado   SERIAL PRIMARY KEY,
    ds_estado   VARCHAR(120) NOT NULL,
    id_pais     INTEGER REFERENCES pais(id_pais)
);
CREATE INDEX idx_estado_id_pais ON estado(id_pais);

CREATE TABLE oriente (
    id_oriente  SERIAL PRIMARY KEY,
    ds_oriente  VARCHAR(150) NOT NULL,
    id_estado   INTEGER REFERENCES estado(id_estado)
);
CREATE INDEX idx_oriente_id_estado ON oriente(id_estado);

CREATE TABLE potencia (
    id_potencia SERIAL PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    dt_criacao  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE ritus (
    id_ritu     SERIAL PRIMARY KEY,
    ds_ritu     VARCHAR(150) NOT NULL,
    dt_criacao  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE grau (
    id_grau     SERIAL PRIMARY KEY,
    ds_grau     VARCHAR(150) NOT NULL,
    id_ritu     INTEGER REFERENCES ritus(id_ritu)
);
CREATE INDEX idx_grau_id_ritu ON grau(id_ritu);

CREATE TABLE lojas (
    id_loja       SERIAL PRIMARY KEY,
    id_potencia   INTEGER REFERENCES potencia(id_potencia),
    id_oriente    INTEGER REFERENCES oriente(id_oriente),
    id_ritu       INTEGER REFERENCES ritus(id_ritu),
    ds_loja       VARCHAR(200) NOT NULL,
    ds_endereco   VARCHAR(255),
    nm_veneravel  VARCHAR(150),
    dt_criacao    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_lojas_id_potencia ON lojas(id_potencia);
CREATE INDEX idx_lojas_id_oriente ON lojas(id_oriente);
CREATE INDEX idx_lojas_id_ritu ON lojas(id_ritu);

CREATE TABLE macons (
    id_macom       SERIAL PRIMARY KEY,
    cim            INTEGER NOT NULL UNIQUE,
    id_loja        INTEGER REFERENCES lojas(id_loja),
    id_grau        INTEGER REFERENCES grau(id_grau),
    nm_macom       VARCHAR(200) NOT NULL,
    dt_nascimento  TIMESTAMP,
    dt_iniciacao   TIMESTAMP,
    dt_elevacao    TIMESTAMP,
    dt_exaltacao   TIMESTAMP,
    nr_ddd         VARCHAR(3),
    nr_celular     VARCHAR(20),
    ds_endereco    VARCHAR(255)
);
CREATE INDEX idx_macons_id_loja ON macons(id_loja);
CREATE INDEX idx_macons_id_grau ON macons(id_grau);
CREATE INDEX idx_macons_cim ON macons(cim);
