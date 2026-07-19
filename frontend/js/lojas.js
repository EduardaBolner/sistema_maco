exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'lojas', titulo: 'Lojas', breadcrumb: 'Início / Lojas' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const selectPotencia = document.getElementById('id_potencia');
const selectOriente = document.getElementById('id_oriente');
const selectRitu = document.getElementById('id_ritu');

let debounceBusca = null;
let lojasCache = [];
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

configurarBuscaLocalizacao({
    input: document.getElementById('ds_endereco'),
    lista: document.getElementById('lista-endereco-geo'),
    obterValorCampo: (sugestao) => sugestao.descricao
});

async function carregarSelects() {
    try {
        const [potencias, orientes, ritos] = await Promise.all([
            apiGet('/potencias'), apiGet('/orientes'), apiGet('/ritos')
        ]);
        popularSelect(selectPotencia, potencias, 'id_potencia', 'nome');
        popularSelect(selectOriente, orientes, 'id_oriente', 'ds_oriente');
        popularSelect(selectRitu, ritos, 'id_ritu', 'ds_ritu');
    } catch (erro) {
        mostrarErro('Não foi possível carregar potências, orientes e ritos.');
    }
}

function entrarModoEdicao(loja) {
    editandoId = loja.id_loja;
    document.getElementById('ds_loja').value = loja.ds_loja;
    document.getElementById('nm_veneravel').value = loja.nm_veneravel || '';
    document.getElementById('ds_endereco').value = loja.ds_endereco || '';
    selectPotencia.value = loja.id_potencia || '';
    selectOriente.value = loja.id_oriente || '';
    selectRitu.value = loja.id_ritu || '';
    tituloFormulario.textContent = 'Editar Loja';
    botaoSalvar.textContent = 'Salvar edição';
    botaoCancelar.hidden = false;
}

function sairModoEdicao() {
    editandoId = null;
    document.getElementById('form-loja').reset();
    tituloFormulario.textContent = 'Cadastrar Loja';
    botaoSalvar.textContent = 'Salvar Loja';
    botaoCancelar.hidden = true;
}

async function carregarTabela(nome) {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const query = nome ? `?nome=${encodeURIComponent(nome)}` : '';
        lojasCache = await apiGet(`/lojas${query}`);
        if (!lojasCache.length) {
            corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma loja encontrada</td></tr>`;
            return;
        }
        corpo.innerHTML = lojasCache.map(l => `
            <tr>
                <td>${l.ds_loja}</td>
                <td>${l.nm_veneravel || '—'}</td>
                <td>${l.nome_potencia || '—'}</td>
                <td>${l.ds_oriente || '—'}</td>
                <td>${l.ds_ritu || '—'}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${l.id_loja}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${l.id_loja}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar as lojas. Verifique se a API está em execução.');
    }
}

document.getElementById('corpo-tabela').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const loja = lojasCache.find(l => l.id_loja == botaoEditar.dataset.id);
        if (loja) entrarModoEdicao(loja);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir esta Loja?')) return;
        try {
            await apiDelete(`/lojas/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Loja excluída com sucesso.');
            if (editandoId == botaoExcluir.dataset.id) sairModoEdicao();
            carregarTabela();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('botao-cancelar').addEventListener('click', sairModoEdicao);

document.getElementById('busca-nome-loja').addEventListener('input', (evento) => {
    clearTimeout(debounceBusca);
    const valor = evento.target.value.trim();
    debounceBusca = setTimeout(() => carregarTabela(valor), 300);
});

document.getElementById('form-loja').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_loja = document.getElementById('ds_loja').value.trim();
    if (!ds_loja) return;

    const dados = {
        ds_loja,
        nm_veneravel: document.getElementById('nm_veneravel').value.trim() || null,
        id_potencia: selectPotencia.value || null,
        id_oriente: selectOriente.value || null,
        id_ritu: selectRitu.value || null,
        ds_endereco: document.getElementById('ds_endereco').value.trim() || null
    };

    try {
        if (editandoId) {
            await apiPut(`/lojas/${editandoId}`, dados);
            mostrarSucesso('Loja atualizada com sucesso.');
        } else {
            await apiPost('/lojas', dados);
            mostrarSucesso('Loja cadastrada com sucesso.');
        }
        sairModoEdicao();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarSelects();
carregarTabela();
