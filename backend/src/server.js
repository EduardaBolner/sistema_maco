require('dotenv').config();
const express = require('express');
const cors = require('cors');

const exigirAutenticacao = require('./middleware/auth');
const { exigirAdmin } = require('./middleware/auth');

const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const paisesRouter = require('./routes/paises');
const estadosRouter = require('./routes/estados');
const orientesRouter = require('./routes/orientes');
const potenciasRouter = require('./routes/potencias');
const ritosRouter = require('./routes/ritos');
const grausRouter = require('./routes/graus');
const lojasRouter = require('./routes/lojas');
const maconsRouter = require('./routes/macons');
const geoRouter = require('./routes/geo');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);

app.use(exigirAutenticacao);

// Quadro de Membros: leitura liberada para qualquer usuário autenticado.
// Escrita (POST/PUT/DELETE) e as demais entidades exigem papel admin.
app.use('/macons', maconsRouter);

app.use('/usuarios', exigirAdmin, usuariosRouter);
app.use('/paises', exigirAdmin, paisesRouter);
app.use('/estados', exigirAdmin, estadosRouter);
app.use('/orientes', exigirAdmin, orientesRouter);
app.use('/potencias', exigirAdmin, potenciasRouter);
app.use('/ritos', exigirAdmin, ritosRouter);
app.use('/graus', exigirAdmin, grausRouter);
app.use('/lojas', exigirAdmin, lojasRouter);
app.use('/geo', exigirAdmin, geoRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API do Sistema de Cadastros rodando na porta ${PORT}`);
});
