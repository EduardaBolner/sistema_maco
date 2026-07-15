const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { id_ritu } = req.query;
        const params = [];
        let query = `SELECT g.id_grau, g.ds_grau, g.id_ritu, r.ds_ritu
                      FROM grau g
                      LEFT JOIN ritus r ON r.id_ritu = g.id_ritu`;
        if (id_ritu) {
            params.push(id_ritu);
            query += ' WHERE g.id_ritu = $1';
        }
        query += ' ORDER BY g.ds_grau';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_grau, id_ritu } = req.body;
        if (!ds_grau || !ds_grau.trim()) {
            return res.status(400).json({ erro: 'ds_grau é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO grau (ds_grau, id_ritu) VALUES ($1, $2) RETURNING id_grau, ds_grau, id_ritu',
            [ds_grau.trim(), id_ritu || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
