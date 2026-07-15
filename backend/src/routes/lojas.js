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

router.put('/:id', async (req, res, next) => {
    try {
        const { ds_loja, id_potencia, id_oriente, id_ritu, ds_endereco, nm_veneravel } = req.body;
        if (!ds_loja || !ds_loja.trim()) {
            return res.status(400).json({ erro: 'ds_loja é obrigatório' });
        }
        const result = await pool.query(
            `UPDATE lojas SET
                ds_loja = $1, id_potencia = $2, id_oriente = $3, id_ritu = $4,
                ds_endereco = $5, nm_veneravel = $6
             WHERE id_loja = $7
             RETURNING id_loja, ds_loja, id_potencia, id_oriente, id_ritu, ds_endereco, nm_veneravel, dt_criacao`,
            [ds_loja.trim(), id_potencia || null, id_oriente || null, id_ritu || null,
             ds_endereco || null, nm_veneravel || null, req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ erro: 'Loja não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM lojas WHERE id_loja = $1', [req.params.id]);
        if (!result.rowCount) {
            return res.status(404).json({ erro: 'Loja não encontrada' });
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({ erro: 'Não é possível excluir: existem Maçons vinculados a esta Loja.' });
        }
        next(err);
    }
});

module.exports = router;
