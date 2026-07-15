const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { id_pais } = req.query;
        const params = [];
        let query = `SELECT e.id_estado, e.ds_estado, e.id_pais, p.ds_pais
                      FROM estado e
                      LEFT JOIN pais p ON p.id_pais = e.id_pais`;
        if (id_pais) {
            params.push(id_pais);
            query += ' WHERE e.id_pais = $1';
        }
        query += ' ORDER BY e.ds_estado';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_estado, id_pais } = req.body;
        if (!ds_estado || !ds_estado.trim()) {
            return res.status(400).json({ erro: 'ds_estado é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO estado (ds_estado, id_pais) VALUES ($1, $2) RETURNING id_estado, ds_estado, id_pais',
            [ds_estado.trim(), id_pais || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { ds_estado, id_pais } = req.body;
        if (!ds_estado || !ds_estado.trim()) {
            return res.status(400).json({ erro: 'ds_estado é obrigatório' });
        }
        const result = await pool.query(
            'UPDATE estado SET ds_estado = $1, id_pais = $2 WHERE id_estado = $3 RETURNING id_estado, ds_estado, id_pais',
            [ds_estado.trim(), id_pais || null, req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ erro: 'Estado não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM estado WHERE id_estado = $1', [req.params.id]);
        if (!result.rowCount) {
            return res.status(404).json({ erro: 'Estado não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({ erro: 'Não é possível excluir: existem Orientes vinculados a este Estado.' });
        }
        next(err);
    }
});

module.exports = router;
