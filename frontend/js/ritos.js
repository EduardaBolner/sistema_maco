exigirAutenticacao();
renderizarShell({ ativo: 'ritos', titulo: 'Ritos', breadcrumb: 'Início / Ritos' });

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
        const ritos = await apiGet('/ritos');
        if (!ritos.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum rito cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = ritos.map(r => `
            <tr>
                <td>${r.ds_ritu}</td>
                <td>${r.dt_criacao ? new Date(r.dt_criacao).toLocaleDateString('pt-BR') : ''}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os ritos. Verifique se a API está em execução.');
    }
}

document.getElementById('form-rito').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_ritu = document.getElementById('ds_ritu').value.trim();
    if (!ds_ritu) return;
    try {
        await apiPost('/ritos', { ds_ritu });
        mostrarSucesso('Rito cadastrado com sucesso.');
        document.getElementById('form-rito').reset();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabela();
