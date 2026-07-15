const jwt = require('jsonwebtoken');

function exigirAutenticacao(req, res, next) {
    const cabecalho = req.headers.authorization;
    const token = cabecalho && cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;

    if (!token) {
        return res.status(401).json({ erro: 'Token de autenticação ausente' });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Token de autenticação inválido ou expirado' });
    }
}

module.exports = exigirAutenticacao;
