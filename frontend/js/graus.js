exigirAutenticacao();
renderizarShell({ ativo: 'graus', titulo: 'Graus', breadcrumb: 'Início / Graus' });

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

async function carregarSelectRitos() {
    const select = document.getElementById('id_ritu');
    try {
        const ritos = await apiGet('/ritos');
        ritos.forEach(r => {
            const option = document.createElement('option');
            option.value = r.id_ritu;
            option.textContent = r.ds_ritu;
            select.appendChild(option);
        });
    } catch (erro) {
        mostrarErro('Não foi possível carregar os ritos.');
    }
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const graus = await apiGet('/graus');
        if (!graus.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum grau cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = graus.map(g => `
            <tr>
                <td>${g.ds_grau}</td>
                <td>${g.ds_ritu || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os graus. Verifique se a API está em execução.');
    }
}

document.getElementById('form-grau').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_grau = document.getElementById('ds_grau').value.trim();
    const id_ritu = document.getElementById('id_ritu').value || null;
    if (!ds_grau) return;
    try {
        await apiPost('/graus', { ds_grau, id_ritu });
        mostrarSucesso('Grau cadastrado com sucesso.');
        document.getElementById('form-grau').reset();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarSelectRitos();
carregarTabela();
