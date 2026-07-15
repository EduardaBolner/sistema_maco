exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'ritos', titulo: 'Ritos', breadcrumb: 'Início / Ritos' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');

let ritosCache = [];
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

function entrarModoEdicao(rito) {
    editandoId = rito.id_ritu;
    document.getElementById('ds_ritu').value = rito.ds_ritu;
    tituloFormulario.textContent = 'Editar Rito';
    botaoSalvar.textContent = 'Salvar edição';
    botaoCancelar.hidden = false;
}

function sairModoEdicao() {
    editandoId = null;
    document.getElementById('form-rito').reset();
    tituloFormulario.textContent = 'Cadastrar Rito';
    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.hidden = true;
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        ritosCache = await apiGet('/ritos');
        if (!ritosCache.length) {
            corpo.innerHTML = `<tr><td colspan="3" class="vazio">Nenhum rito cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = ritosCache.map(r => `
            <tr>
                <td>${r.ds_ritu}</td>
                <td>${r.dt_criacao ? new Date(r.dt_criacao).toLocaleDateString('pt-BR') : ''}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${r.id_ritu}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${r.id_ritu}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os ritos. Verifique se a API está em execução.');
    }
}

document.getElementById('corpo-tabela').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const rito = ritosCache.find(r => r.id_ritu == botaoEditar.dataset.id);
        if (rito) entrarModoEdicao(rito);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este Rito?')) return;
        try {
            await apiDelete(`/ritos/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Rito excluído com sucesso.');
            if (editandoId == botaoExcluir.dataset.id) sairModoEdicao();
            carregarTabela();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('botao-cancelar').addEventListener('click', sairModoEdicao);

document.getElementById('form-rito').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_ritu = document.getElementById('ds_ritu').value.trim();
    if (!ds_ritu) return;
    try {
        if (editandoId) {
            await apiPut(`/ritos/${editandoId}`, { ds_ritu });
            mostrarSucesso('Rito atualizado com sucesso.');
        } else {
            await apiPost('/ritos', { ds_ritu });
            mostrarSucesso('Rito cadastrado com sucesso.');
        }
        sairModoEdicao();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabela();
