// Cria (ou atualiza a senha de) um usuário do sistema.
// Uso: node scripts/criar-usuario.js "Nome Completo" login senha

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

async function main() {
    const [nome, login, senha] = process.argv.slice(2);

    if (!nome || !login || !senha) {
        console.error('Uso: node scripts/criar-usuario.js "Nome Completo" login senha');
        process.exit(1);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
        `INSERT INTO usuario (nm_usuario, login, senha_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (login) DO UPDATE SET nm_usuario = $1, senha_hash = $3`,
        [nome, login, senhaHash]
    );

    console.log(`Usuário "${login}" criado/atualizado com sucesso.`);
    await pool.end();
}

main().catch((err) => {
    console.error('Erro ao criar usuário:', err.message);
    process.exit(1);
});
