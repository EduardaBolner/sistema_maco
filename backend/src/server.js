require('dotenv').config();
const express = require('express');
const cors = require('cors');

const paisesRouter = require('./routes/paises');
const estadosRouter = require('./routes/estados');
const orientesRouter = require('./routes/orientes');
const potenciasRouter = require('./routes/potencias');
const ritosRouter = require('./routes/ritos');
const grausRouter = require('./routes/graus');
const lojasRouter = require('./routes/lojas');
const maconsRouter = require('./routes/macons');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/paises', paisesRouter);
app.use('/estados', estadosRouter);
app.use('/orientes', orientesRouter);
app.use('/potencias', potenciasRouter);
app.use('/ritos', ritosRouter);
app.use('/graus', grausRouter);
app.use('/lojas', lojasRouter);
app.use('/macons', maconsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API do Sistema de Cadastros rodando na porta ${PORT}`);
});
