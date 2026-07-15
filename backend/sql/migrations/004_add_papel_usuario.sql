-- Adiciona papel de acesso (admin/usuario) e vinculo opcional a um Macom

ALTER TABLE usuario ADD COLUMN papel VARCHAR(20) NOT NULL DEFAULT 'admin';
ALTER TABLE usuario ADD COLUMN id_macom INTEGER REFERENCES macons(id_macom);
CREATE INDEX idx_usuario_id_macom ON usuario(id_macom);
