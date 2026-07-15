const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { nome } = req.query;
        const params = [];
        let query = `SELECT l.id_loja, l.ds_loja, l.ds_endereco, l.nm_veneravel, l.dt_criacao,
                            l.id_potencia, po.nome AS nome_potencia,
                            l.id_oriente, o.ds_oriente,
                            l.id_ritu, r.ds_ritu
                     FROM lojas l
                     LEFT JOIN potencia po ON po.id_potencia = l.id_potencia
                     LEFT JOIN oriente o ON o.id_oriente = l.id_oriente
                     LEFT JOIN ritus r ON r.id_ritu = l.id_ritu`;
        if (nome) {
            params.push(`%${nome}%`);
            query += ' WHERE l.ds_loja ILIKE $1';
        }
        query += ' ORDER BY l.ds_loja';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ds_loja, id_potencia, id_oriente, id_ritu, ds_endereco, nm_veneravel } = req.body;
        if (!ds_loja || !ds_loja.trim()) {
            return res.status(400).json({ erro: 'ds_loja é obrigatório' });
        }
        const result = await pool.query(
            `INSERT INTO lojas (ds_loja, id_potencia, id_oriente, id_ritu, ds_endereco, nm_veneravel)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_loja, ds_loja, id_potencia, id_oriente, id_ritu, ds_endereco, nm_veneravel, dt_criacao`,
            [ds_loja.trim(), id_potencia || null, id_oriente || null, id_ritu || null, ds_endereco || null, nm_veneravel || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
