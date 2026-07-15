const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { id_estado } = req.query;
        const params = [];
        let query = `SELECT o.id_oriente, o.ds_oriente, o.id_estado, e.ds_estado, e.id_pais, p.ds_pais
                      FROM oriente o
                      LEFT JOIN estado e ON e.id_estado = o.id_estado
                      LEFT JOIN pais p ON p.id_pais = e.id_pais`;
        if (id_estado) {
            params.push(id_estado);
            query += ' WHERE o.id_estado = $1';
        }
        query += ' ORDER BY o.ds_oriente';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_oriente, id_estado } = req.body;
        if (!ds_oriente || !ds_oriente.trim()) {
            return res.status(400).json({ erro: 'ds_oriente é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO oriente (ds_oriente, id_estado) VALUES ($1, $2) RETURNING id_oriente, ds_oriente, id_estado',
            [ds_oriente.trim(), id_estado || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
