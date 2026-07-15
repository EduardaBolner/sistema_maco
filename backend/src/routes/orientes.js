const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT o.id_oriente, o.ds_oriente, o.id_pais, p.ds_pais
             FROM oriente o
             LEFT JOIN pais p ON p.id_pais = o.id_pais
             ORDER BY o.ds_oriente`
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_oriente, id_pais } = req.body;
        if (!ds_oriente || !ds_oriente.trim()) {
            return res.status(400).json({ erro: 'ds_oriente é obrigatório' });
        }
        const result = await pool.query(
            'INSERT INTO oriente (ds_oriente, id_pais) VALUES ($1, $2) RETURNING id_oriente, ds_oriente, id_pais',
            [ds_oriente.trim(), id_pais || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
