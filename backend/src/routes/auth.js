const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        const { login, senha } = req.body;
        if (!login || !senha) {
            return res.status(400).json({ erro: 'Informe login e senha' });
        }

        const resultado = await pool.query(
            'SELECT id_usuario, nm_usuario, login, senha_hash FROM usuario WHERE login = $1',
            [login.trim()]
        );
        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaConfere) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, login: usuario.login, nome: usuario.nm_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({ token, nome: usuario.nm_usuario });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
