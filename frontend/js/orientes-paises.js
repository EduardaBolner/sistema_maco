exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'orientes', titulo: 'Oriente / Estado / País', breadcrumb: 'Início / Oriente, Estado e País' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');

const selectEstado = document.getElementById('select-estado');
const selectPais = document.getElementById('select-pais');

let paisesCache = [];
let estadosCache = [];
let orientesCache = [];
let editandoIdOriente = null;

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

// ---------- Criação rápida de Estado/País (fallback manual) ----------

configurarSelecaoComNovo({
    select: selectPais,
    botaoNovo: document.getElementById('btn-novo-pais'),
    miniForm: document.getElementById('mini-pais'),
    inputNome: document.getElementById('input-novo-pais'),
    botaoSalvar: document.getElementById('salvar-novo-pais'),
    valueKey: 'id_pais', labelKey: 'ds_pais',
    carregarOpcoes: () => apiGet('/paises'),
    criar: async (nome) => {
        try {
            const novo = await apiPost('/paises', { ds_pais: nome });
            carregarTabelaPaises();
            return novo;
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

configurarSelecaoComNovo({
    select: selectEstado,
    botaoNovo: document.getElementById('btn-novo-estado'),
    miniForm: document.getElementById('mini-estado'),
    inputNome: document.getElementById('input-novo-estado'),
    botaoSalvar: document.getElementById('salvar-novo-estado'),
    valueKey: 'id_estado', labelKey: 'ds_estado',
    carregarOpcoes: () => apiGet('/estados'),
    criar: async (nome) => {
        try {
            const novo = await apiPost('/estados', { ds_estado: nome, id_pais: selectPais.value || null });
            carregarTabelaEstados();
            return novo;
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
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
            popularSelect(selectPais, await apiGet('/paises'), 'id_pais', 'ds_pais');
            selectPais.value = pais.id_pais;
            carregarTabelaPaises();

            if (!sugestao.estado) {
                mostrarErro('País identificado, mas sem Estado. Selecione ou cadastre o Estado manualmente abaixo.');
                return;
            }

            const estado = await garantirEstado(sugestao.estado, pais.id_pais);
            popularSelect(selectEstado, await apiGet('/estados'), 'id_estado', 'ds_estado');
            selectEstado.value = estado.id_estado;
            carregarTabelaEstados();

            mostrarSucesso(`Localização encontrada: ${estado.ds_estado} / ${pais.ds_pais} (preenchidos automaticamente).`);
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

// ---------- Tabelas ----------

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

async function carregarTabelaEstados() {
    const corpo = document.getElementById('corpo-tabela-estado');
    try {
        estadosCache = await apiGet('/estados');
        if (!estadosCache.length) {
            corpo.innerHTML = `<tr><td colspan="3" class="vazio">Nenhum estado cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = estadosCache.map(e => `
            <tr>
                <td>${e.ds_estado}</td>
                <td>${e.ds_pais || '—'}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${e.id_estado}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${e.id_estado}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os estados.');
    }
}

async function carregarTabelaPaises() {
    const corpo = document.getElementById('corpo-tabela-pais');
    try {
        paisesCache = await apiGet('/paises');
        if (!paisesCache.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum país cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = paisesCache.map(p => `
            <tr>
                <td>${p.ds_pais}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${p.id_pais}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${p.id_pais}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os países.');
    }
}

// ---------- Oriente: criar / editar / excluir ----------

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

// ---------- Estado: editar / excluir ----------

const painelEditarEstado = document.getElementById('painel-editar-estado');
let editandoIdEstado = null;

async function entrarEdicaoEstado(estado) {
    editandoIdEstado = estado.id_estado;
    document.getElementById('editar-estado-nome').value = estado.ds_estado;
    const selectEditarPais = document.getElementById('editar-estado-pais');
    popularSelect(selectEditarPais, await apiGet('/paises'), 'id_pais', 'ds_pais');
    selectEditarPais.value = estado.id_pais || '';
    painelEditarEstado.removeAttribute('hidden');
}

function sairEdicaoEstado() {
    editandoIdEstado = null;
    painelEditarEstado.setAttribute('hidden', '');
}

document.getElementById('editar-estado-cancelar').addEventListener('click', sairEdicaoEstado);

document.getElementById('editar-estado-salvar').addEventListener('click', async () => {
    const ds_estado = document.getElementById('editar-estado-nome').value.trim();
    const id_pais = document.getElementById('editar-estado-pais').value || null;
    if (!ds_estado) return;
    try {
        await apiPut(`/estados/${editandoIdEstado}`, { ds_estado, id_pais });
        mostrarSucesso('Estado atualizado com sucesso.');
        sairEdicaoEstado();
        carregarTabelaEstados();
        popularSelect(selectEstado, await apiGet('/estados'), 'id_estado', 'ds_estado');
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

document.getElementById('corpo-tabela-estado').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const estado = estadosCache.find(e => e.id_estado == botaoEditar.dataset.id);
        if (estado) entrarEdicaoEstado(estado);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este Estado?')) return;
        try {
            await apiDelete(`/estados/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Estado excluído com sucesso.');
            if (editandoIdEstado == botaoExcluir.dataset.id) sairEdicaoEstado();
            carregarTabelaEstados();
            popularSelect(selectEstado, await apiGet('/estados'), 'id_estado', 'ds_estado');
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

// ---------- País: editar / excluir ----------

const painelEditarPais = document.getElementById('painel-editar-pais');
let editandoIdPais = null;

function entrarEdicaoPais(pais) {
    editandoIdPais = pais.id_pais;
    document.getElementById('editar-pais-nome').value = pais.ds_pais;
    painelEditarPais.removeAttribute('hidden');
}

function sairEdicaoPais() {
    editandoIdPais = null;
    painelEditarPais.setAttribute('hidden', '');
}

document.getElementById('editar-pais-cancelar').addEventListener('click', sairEdicaoPais);

document.getElementById('editar-pais-salvar').addEventListener('click', async () => {
    const ds_pais = document.getElementById('editar-pais-nome').value.trim();
    if (!ds_pais) return;
    try {
        await apiPut(`/paises/${editandoIdPais}`, { ds_pais });
        mostrarSucesso('País atualizado com sucesso.');
        sairEdicaoPais();
        carregarTabelaPaises();
        popularSelect(selectPais, await apiGet('/paises'), 'id_pais', 'ds_pais');
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

document.getElementById('corpo-tabela-pais').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const pais = paisesCache.find(p => p.id_pais == botaoEditar.dataset.id);
        if (pais) entrarEdicaoPais(pais);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este País?')) return;
        try {
            await apiDelete(`/paises/${botaoExcluir.dataset.id}`);
            mostrarSucesso('País excluído com sucesso.');
            if (editandoIdPais == botaoExcluir.dataset.id) sairEdicaoPais();
            carregarTabelaPaises();
            popularSelect(selectPais, await apiGet('/paises'), 'id_pais', 'ds_pais');
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

// ---------- Inicialização ----------

async function carregarSelecoesIniciais() {
    const [estados, paises] = await Promise.all([apiGet('/estados'), apiGet('/paises')]);
    popularSelect(selectEstado, estados, 'id_estado', 'ds_estado');
    popularSelect(selectPais, paises, 'id_pais', 'ds_pais');
}

carregarSelecoesIniciais();
carregarTabelaOrientes();
carregarTabelaEstados();
carregarTabelaPaises();
