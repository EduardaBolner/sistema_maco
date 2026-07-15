-- Adiciona a entidade Estado entre Pais e Oriente

CREATE TABLE estado (
    id_estado   SERIAL PRIMARY KEY,
    ds_estado   VARCHAR(120) NOT NULL,
    id_pais     INTEGER REFERENCES pais(id_pais)
);
CREATE INDEX idx_estado_id_pais ON estado(id_pais);

ALTER TABLE oriente ADD COLUMN id_estado INTEGER REFERENCES estado(id_estado);
CREATE INDEX idx_oriente_id_estado ON oriente(id_estado);

ALTER TABLE oriente DROP COLUMN id_pais;
