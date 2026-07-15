exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'graus', titulo: 'Graus', breadcrumb: 'Início / Graus' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const selectRito = document.getElementById('id_ritu');

let grausCache = [];
let editandoId = null;

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
    try {
        const ritos = await apiGet('/ritos');
        popularSelect(selectRito, ritos, 'id_ritu', 'ds_ritu');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os ritos.');
    }
}

function entrarModoEdicao(grau) {
    editandoId = grau.id_grau;
    document.getElementById('ds_grau').value = grau.ds_grau;
    selectRito.value = grau.id_ritu || '';
    tituloFormulario.textContent = 'Editar Grau';
    botaoSalvar.textContent = 'Salvar edição';
    botaoCancelar.hidden = false;
}

function sairModoEdicao() {
    editandoId = null;
    document.getElementById('form-grau').reset();
    tituloFormulario.textContent = 'Cadastrar Grau';
    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.hidden = true;
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        grausCache = await apiGet('/graus');
        if (!grausCache.length) {
            corpo.innerHTML = `<tr><td colspan="3" class="vazio">Nenhum grau cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = grausCache.map(g => `
            <tr>
                <td>${g.ds_grau}</td>
                <td>${g.ds_ritu || '—'}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${g.id_grau}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${g.id_grau}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os graus. Verifique se a API está em execução.');
    }
}

document.getElementById('corpo-tabela').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const grau = grausCache.find(g => g.id_grau == botaoEditar.dataset.id);
        if (grau) entrarModoEdicao(grau);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este Grau?')) return;
        try {
            await apiDelete(`/graus/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Grau excluído com sucesso.');
            if (editandoId == botaoExcluir.dataset.id) sairModoEdicao();
            carregarTabela();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('botao-cancelar').addEventListener('click', sairModoEdicao);

document.getElementById('form-grau').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_grau = document.getElementById('ds_grau').value.trim();
    const id_ritu = selectRito.value || null;
    if (!ds_grau) return;
    try {
        if (editandoId) {
            await apiPut(`/graus/${editandoId}`, { ds_grau, id_ritu });
            mostrarSucesso('Grau atualizado com sucesso.');
        } else {
            await apiPost('/graus', { ds_grau, id_ritu });
            mostrarSucesso('Grau cadastrado com sucesso.');
        }
        sairModoEdicao();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarSelectRitos();
carregarTabela();
