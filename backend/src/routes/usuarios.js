const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const resultado = await pool.query(
            `SELECT u.id_usuario, u.nm_usuario, u.login, u.papel, u.id_macom, m.cim, u.dt_criacao
             FROM usuario u
             LEFT JOIN macons m ON m.id_macom = u.id_macom
             ORDER BY u.nm_usuario`
        );
        res.json(resultado.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { id_macom, nm_usuario, login, senha, papel } = req.body;

        if (!login || !login.trim()) {
            return res.status(400).json({ erro: 'login é obrigatório' });
        }
        if (!senha) {
            return res.status(400).json({ erro: 'senha é obrigatória' });
        }
        if (!['admin', 'usuario'].includes(papel)) {
            return res.status(400).json({ erro: 'papel deve ser "admin" ou "usuario"' });
        }

        let nome = nm_usuario ? nm_usuario.trim() : null;
        if (id_macom) {
            const macom = await pool.query('SELECT nm_macom FROM macons WHERE id_macom = $1', [id_macom]);
            if (!macom.rows[0]) {
                return res.status(400).json({ erro: 'Maçom não encontrado' });
            }
            nome = macom.rows[0].nm_macom;
        }
        if (!nome) {
            return res.status(400).json({ erro: 'Informe um Maçom vinculado ou o nome do usuário' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(
            `INSERT INTO usuario (nm_usuario, login, senha_hash, papel, id_macom)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_usuario, nm_usuario, login, papel, id_macom, dt_criacao`,
            [nome, login.trim(), senhaHash, papel, id_macom || null]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Já existe um usuário com este login' });
        }
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { login, senha, papel, id_macom } = req.body;

        if (!login || !login.trim()) {
            return res.status(400).json({ erro: 'login é obrigatório' });
        }
        if (!['admin', 'usuario'].includes(papel)) {
            return res.status(400).json({ erro: 'papel deve ser "admin" ou "usuario"' });
        }

        let nome = null;
        if (id_macom) {
            const macom = await pool.query('SELECT nm_macom FROM macons WHERE id_macom = $1', [id_macom]);
            if (!macom.rows[0]) {
                return res.status(400).json({ erro: 'Maçom não encontrado' });
            }
            nome = macom.rows[0].nm_macom;
        }

        const campos = ['login = $1', 'papel = $2', 'id_macom = $3'];
        const valores = [login.trim(), papel, id_macom || null];

        if (nome) {
            campos.push(`nm_usuario = $${valores.length + 1}`);
            valores.push(nome);
        }
        if (senha) {
            const senhaHash = await bcrypt.hash(senha, 10);
            campos.push(`senha_hash = $${valores.length + 1}`);
            valores.push(senhaHash);
        }

        valores.push(id);
        const resultado = await pool.query(
            `UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = $${valores.length}
             RETURNING id_usuario, nm_usuario, login, papel, id_macom, dt_criacao`,
            valores
        );

        if (!resultado.rows[0]) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json(resultado.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Já existe um usuário com este login' });
        }
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const resultado = await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [req.params.id]);
        if (!resultado.rowCount) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
