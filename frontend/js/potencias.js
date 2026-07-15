exigirAutenticacao();
renderizarShell({ ativo: 'potencias', titulo: 'Potências', breadcrumb: 'Início / Potências' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');

function mostrarErro(mensagem) {
    alertaSucesso.classList.remove('mostrar');
    alertaErro.textContent = mensagem;
    alertaErro.classList.add('mostrar');
}

function mostrarSucesso(mensagem) {
    alertaErro.classList.remove('mostrar');
    alertaSucesso.textContent = mensagem;
    alertaSucesso.classList.add('mostrar');
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const potencias = await apiGet('/potencias');
        if (!potencias.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhuma potência cadastrada</td></tr>`;
            return;
        }
        corpo.innerHTML = potencias.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.dt_criacao ? new Date(p.dt_criacao).toLocaleDateString('pt-BR') : ''}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar as potências. Verifique se a API está em execução.');
    }
}

document.getElementById('form-potencia').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    if (!nome) return;
    try {
        await apiPost('/potencias', { nome });
        mostrarSucesso('Potência cadastrada com sucesso.');
        document.getElementById('form-potencia').reset();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabela();
