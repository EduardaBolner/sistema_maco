exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'orientes', titulo: 'Oriente / Estado / País', breadcrumb: 'Início / Oriente, Estado e País' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');

const selectEstado = document.getElementById('select-estado');
const selectPais = document.getElementById('select-pais');
const inputNovoEstado = document.getElementById('input-novo-estado');
const inputNovoPais = document.getElementById('input-novo-pais');
const miniEstado = document.getElementById('mini-estado');
const miniPais = document.getElementById('mini-pais');
const botaoSalvarEstado = document.getElementById('salvar-novo-estado');
const botaoSalvarPais = document.getElementById('salvar-novo-pais');

let orientesCache = [];
let editandoIdOriente = null;
let editandoIdEstado = null;
let editandoIdPais = null;

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

async function atualizarSelectsEstadoPais() {
    const [estados, paises] = await Promise.all([apiGet('/estados'), apiGet('/paises')]);
    popularSelect(selectEstado, estados, 'id_estado', 'ds_estado');
    popularSelect(selectPais, paises, 'id_pais', 'ds_pais');
    return { estados, paises };
}

// ---------- País (usado dentro da criação/edição de Estado) ----------

function abrirMiniPaisParaCriar() {
    editandoIdPais = null;
    inputNovoPais.value = '';
    botaoSalvarPais.textContent = 'Salvar';
    miniPais.removeAttribute('hidden');
}

document.getElementById('btn-novo-pais').addEventListener('click', () => {
    if (miniPais.hasAttribute('hidden')) abrirMiniPaisParaCriar();
    else miniPais.setAttribute('hidden', '');
});

document.getElementById('btn-editar-pais').addEventListener('click', async () => {
    const id = selectPais.value;
    if (!id) { mostrarErro('Selecione um País para editar.'); return; }
    const paises = await apiGet('/paises');
    const pais = paises.find(p => p.id_pais == id);
    if (!pais) return;
    editandoIdPais = pais.id_pais;
    inputNovoPais.value = pais.ds_pais;
    botaoSalvarPais.textContent = 'Salvar edição';
    miniPais.removeAttribute('hidden');
});

document.getElementById('btn-excluir-pais').addEventListener('click', async () => {
    const id = selectPais.value;
    if (!id) { mostrarErro('Selecione um País para excluir.'); return; }
    if (!confirm('Tem certeza que deseja excluir este País?')) return;
    try {
        await apiDelete(`/paises/${id}`);
        mostrarSucesso('País excluído com sucesso.');
        await atualizarSelectsEstadoPais();
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

botaoSalvarPais.addEventListener('click', async () => {
    const nome = inputNovoPais.value.trim();
    if (!nome) return;
    try {
        let pais;
        if (editandoIdPais) {
            pais = await apiPut(`/paises/${editandoIdPais}`, { ds_pais: nome });
            mostrarSucesso('País atualizado com sucesso.');
        } else {
            pais = await apiPost('/paises', { ds_pais: nome });
            mostrarSucesso('País cadastrado com sucesso.');
        }
        await atualizarSelectsEstadoPais();
        selectPais.value = pais.id_pais;
        miniPais.setAttribute('hidden', '');
        editandoIdPais = null;
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

// ---------- Estado (usado na criação/edição do Oriente) ----------

function abrirMiniEstadoParaCriar() {
    editandoIdEstado = null;
    inputNovoEstado.value = '';
    selectPais.value = '';
    botaoSalvarEstado.textContent = 'Salvar Estado';
    miniEstado.removeAttribute('hidden');
}

document.getElementById('btn-novo-estado').addEventListener('click', () => {
    if (miniEstado.hasAttribute('hidden')) abrirMiniEstadoParaCriar();
    else miniEstado.setAttribute('hidden', '');
});

document.getElementById('btn-editar-estado').addEventListener('click', async () => {
    const id = selectEstado.value;
    if (!id) { mostrarErro('Selecione um Estado para editar.'); return; }
    const estados = await apiGet('/estados');
    const estado = estados.find(e => e.id_estado == id);
    if (!estado) return;
    editandoIdEstado = estado.id_estado;
    inputNovoEstado.value = estado.ds_estado;
    selectPais.value = estado.id_pais || '';
    botaoSalvarEstado.textContent = 'Salvar edição do Estado';
    miniEstado.removeAttribute('hidden');
});

document.getElementById('btn-excluir-estado').addEventListener('click', async () => {
    const id = selectEstado.value;
    if (!id) { mostrarErro('Selecione um Estado para excluir.'); return; }
    if (!confirm('Tem certeza que deseja excluir este Estado?')) return;
    try {
        await apiDelete(`/estados/${id}`);
        mostrarSucesso('Estado excluído com sucesso.');
        await atualizarSelectsEstadoPais();
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

botaoSalvarEstado.addEventListener('click', async () => {
    const nome = inputNovoEstado.value.trim();
    if (!nome) return;
    try {
        let estado;
        if (editandoIdEstado) {
            estado = await apiPut(`/estados/${editandoIdEstado}`, { ds_estado: nome, id_pais: selectPais.value || null });
            mostrarSucesso('Estado atualizado com sucesso.');
        } else {
            estado = await apiPost('/estados', { ds_estado: nome, id_pais: selectPais.value || null });
            mostrarSucesso('Estado cadastrado com sucesso.');
        }
        await atualizarSelectsEstadoPais();
        selectEstado.value = estado.id_estado;
        miniEstado.setAttribute('hidden', '');
        editandoIdEstado = null;
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

// ---------- Busca de localização real (Nominatim) ----------

configurarBuscaLocalizacao({
    input: document.getElementById('ds_oriente'),
    lista: document.getElementById('lista-cidade-geo'),
    aoResolver: async (sugestao) => {
        if (!sugestao.pais) {
            mostrarErro('Essa localização não trouxe País/Estado. Cadastre manualmente abaixo.');
            return;
        }
        try {
            const pais = await garantirPais(sugestao.pais);

            if (!sugestao.estado) {
                await atualizarSelectsEstadoPais();
                selectPais.value = pais.id_pais;
                mostrarErro('País identificado, mas sem Estado. Selecione ou cadastre o Estado manualmente abaixo.');
                return;
            }

            const estado = await garantirEstado(sugestao.estado, pais.id_pais);
            await atualizarSelectsEstadoPais();
            selectEstado.value = estado.id_estado;

            mostrarSucesso(`Localização encontrada: ${estado.ds_estado} / ${pais.ds_pais} (preenchidos automaticamente).`);
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

// ---------- Oriente: tabela / criar / editar / excluir ----------

async function carregarTabelaOrientes() {
    const corpo = document.getElementById('corpo-tabela-oriente');
    try {
        orientesCache = await apiGet('/orientes');
        if (!orientesCache.length) {
            corpo.innerHTML = `<tr><td colspan="4" class="vazio">Nenhum oriente cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = orientesCache.map(o => `
            <tr>
                <td>${o.ds_oriente}</td>
                <td>${o.ds_estado || '—'}</td>
                <td>${o.ds_pais || '—'}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${o.id_oriente}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${o.id_oriente}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os orientes. Verifique se a API está em execução.');
    }
}

function entrarModoEdicaoOriente(oriente) {
    editandoIdOriente = oriente.id_oriente;
    document.getElementById('ds_oriente').value = oriente.ds_oriente;
    selectEstado.value = oriente.id_estado || '';
    document.getElementById('titulo-oriente').textContent = 'Editar Oriente';
    document.getElementById('botao-salvar-oriente').textContent = 'Salvar edição';
    document.getElementById('botao-cancelar-oriente').hidden = false;
}

function sairModoEdicaoOriente() {
    editandoIdOriente = null;
    document.getElementById('form-oriente').reset();
    document.getElementById('titulo-oriente').textContent = 'Cadastrar Oriente';
    document.getElementById('botao-salvar-oriente').textContent = 'Salvar Oriente';
    document.getElementById('botao-cancelar-oriente').hidden = true;
}

document.getElementById('botao-cancelar-oriente').addEventListener('click', sairModoEdicaoOriente);

document.getElementById('corpo-tabela-oriente').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const oriente = orientesCache.find(o => o.id_oriente == botaoEditar.dataset.id);
        if (oriente) entrarModoEdicaoOriente(oriente);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este Oriente?')) return;
        try {
            await apiDelete(`/orientes/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Oriente excluído com sucesso.');
            if (editandoIdOriente == botaoExcluir.dataset.id) sairModoEdicaoOriente();
            carregarTabelaOrientes();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('form-oriente').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_oriente = document.getElementById('ds_oriente').value.trim();
    if (!ds_oriente) return;
    const id_estado = selectEstado.value || null;
    try {
        if (editandoIdOriente) {
            await apiPut(`/orientes/${editandoIdOriente}`, { ds_oriente, id_estado });
            mostrarSucesso('Oriente atualizado com sucesso.');
        } else {
            await apiPost('/orientes', { ds_oriente, id_estado });
            mostrarSucesso('Oriente cadastrado com sucesso.');
        }
        sairModoEdicaoOriente();
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

// ---------- Inicialização ----------

atualizarSelectsEstadoPais();
carregarTabelaOrientes();
