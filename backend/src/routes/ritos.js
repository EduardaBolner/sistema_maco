const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id_ritu, ds_ritu, dt_criacao FROM ritus ORDER BY ds_ritu'
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_ritu } = req.body;
        if (!ds_ritu || !ds_ritu.trim()) {
            return res.status(400).json({ erro: 'ds_ritu é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO ritus (ds_ritu) VALUES ($1) RETURNING id_ritu, ds_ritu, dt_criacao',
            [ds_ritu.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { ds_ritu } = req.body;
        if (!ds_ritu || !ds_ritu.trim()) {
            return res.status(400).json({ erro: 'ds_ritu é obrigatório' });
        }
        const result = await pool.query(
            'UPDATE ritus SET ds_ritu = $1 WHERE id_ritu = $2 RETURNING id_ritu, ds_ritu, dt_criacao',
            [ds_ritu.trim(), req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ erro: 'Rito não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM ritus WHERE id_ritu = $1', [req.params.id]);
        if (!result.rowCount) {
            return res.status(404).json({ erro: 'Rito não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({ erro: 'Não é possível excluir: existem Graus ou Lojas vinculados a este Rito.' });
        }
        next(err);
    }
});

module.exports = router;
