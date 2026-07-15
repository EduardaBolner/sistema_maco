const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { nome, loja, cim } = req.query;
        const conditions = [];
        const params = [];

        if (nome) {
            params.push(`%${nome}%`);
            conditions.push(`m.nm_macom ILIKE $${params.length}`);
        }
        if (loja) {
            params.push(`%${loja}%`);
            conditions.push(`l.ds_loja ILIKE $${params.length}`);
        }
        if (cim) {
            params.push(cim);
            conditions.push(`m.cim = $${params.length}`);
        }

        let query = `SELECT m.id_macom, m.cim, m.nm_macom, m.dt_nascimento, m.dt_iniciacao,
                            m.dt_elevacao, m.dt_exaltacao, m.nr_ddd, m.nr_celular, m.ds_endereco,
                            m.id_loja, l.ds_loja,
                            m.id_grau, g.ds_grau
                     FROM macons m
                     LEFT JOIN lojas l ON l.id_loja = m.id_loja
                     LEFT JOIN grau g ON g.id_grau = m.id_grau`;
        if (conditions.length) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY m.nm_macom';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {
            cim, nm_macom, id_loja, id_grau,
            dt_nascimento, dt_iniciacao, dt_elevacao, dt_exaltacao,
            nr_ddd, nr_celular, ds_endereco
        } = req.body;

        if (!cim) {
            return res.status(400).json({ erro: 'cim é obrigatório' });
        }
        if (!nm_macom || !nm_macom.trim()) {
            return res.status(400).json({ erro: 'nm_macom é obrigatório' });
        }

        const result = await pool.query(
            `INSERT INTO macons (cim, nm_macom, id_loja, id_grau, dt_nascimento, dt_iniciacao, dt_elevacao, dt_exaltacao, nr_ddd, nr_celular, ds_endereco)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id_macom, cim, nm_macom, id_loja, id_grau, dt_nascimento, dt_iniciacao, dt_elevacao, dt_exaltacao, nr_ddd, nr_celular, ds_endereco`,
            [cim, nm_macom.trim(), id_loja || null, id_grau || null,
             dt_nascimento || null, dt_iniciacao || null, dt_elevacao || null, dt_exaltacao || null,
             nr_ddd || null, nr_celular || null, ds_endereco || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Já existe um Maçom cadastrado com este CIM' });
        }
        next(err);
    }
});

module.exports = router;
