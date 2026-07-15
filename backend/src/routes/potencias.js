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

module.exports = router;
