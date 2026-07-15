const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id_potencia, nome, dt_criacao FROM potencia ORDER BY nome'
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { nome } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ erro: 'nome é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO potencia (nome) VALUES ($1) RETURNING id_potencia, nome, dt_criacao',
            [nome.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { nome } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ erro: 'nome é obrigatório' });
        }
        const result = await pool.query(
            'UPDATE potencia SET nome = $1 WHERE id_potencia = $2 RETURNING id_potencia, nome, dt_criacao',
            [nome.trim(), req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ erro: 'Potência não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM potencia WHERE id_potencia = $1', [req.params.id]);
        if (!result.rowCount) {
            return res.status(404).json({ erro: 'Potência não encontrada' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({ erro: 'Não é possível excluir: existem Lojas vinculadas a esta Potência.' });
        }
        next(err);
    }
});

module.exports = router;
