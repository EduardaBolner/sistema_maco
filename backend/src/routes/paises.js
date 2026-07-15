const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id_pais, ds_pais FROM pais ORDER BY ds_pais'
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_pais } = req.body;
        if (!ds_pais || !ds_pais.trim()) {
            return res.status(400).json({ erro: 'ds_pais é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO pais (ds_pais) VALUES ($1) RETURNING id_pais, ds_pais',
            [ds_pais.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { ds_pais } = req.body;
        if (!ds_pais || !ds_pais.trim()) {
            return res.status(400).json({ erro: 'ds_pais é obrigatório' });
        }
        const result = await pool.query(
            'UPDATE pais SET ds_pais = $1 WHERE id_pais = $2 RETURNING id_pais, ds_pais',
            [ds_pais.trim(), req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ erro: 'País não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM pais WHERE id_pais = $1', [req.params.id]);
        if (!result.rowCount) {
            return res.status(404).json({ erro: 'País não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({ erro: 'Não é possível excluir: existem Estados vinculados a este País.' });
        }
        next(err);
    }
});

module.exports = router;
