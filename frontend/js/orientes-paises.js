exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'orientes', titulo: 'Oriente / Estado / País', breadcrumb: 'Início / Oriente, Estado e País' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');

let paisesCache = [];
let estadosCache = [];
let orientesCache = [];

let paisSelecionadoParaEstadoId = null;
let estadoSelecionadoParaOrienteId = null;

let editandoIdPais = null;
let editandoIdEstado = null;
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

// ---------- Combo: País (usado no cadastro de Estado) ----------

configurarCombo({
    input: document.getElementById('busca-pais-estado'),
    lista: document.getElementById('lista-pais-estado'),
    permitirCriar: true,
    obterRotulo: (item) => item.ds_pais,
    buscar: async (termo) => {
        const paises = await apiGet('/paises');
        return paises
            .filter(p => p.ds_pais.toLowerCase().includes(termo.toLowerCase()))
            .map(p => ({ ...p, __id: p.id_pais }));
    },
    aoSelecionar: (item) => { paisSelecionadoParaEstadoId = item.__id; },
    aoCriar: async (termo) => {
        try {
            const novoPais = await apiPost('/paises', { ds_pais: termo });
            mostrarSucesso(`País "${novoPais.ds_pais}" cadastrado.`);
            carregarTabelaPaises();
            return { ...novoPais, __id: novoPais.id_pais };
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

// ---------- Combo: Estado (usado no cadastro de Oriente) ----------

configurarCombo({
    input: document.getElementById('busca-estado-oriente'),
    lista: document.getElementById('lista-estado-oriente'),
    permitirCriar: true,
    obterRotulo: (item) => item.ds_estado,
    buscar: async (termo) => {
        const estados = await apiGet('/estados');
        return estados
            .filter(e => e.ds_estado.toLowerCase().includes(termo.toLowerCase()))
            .map(e => ({ ...e, __id: e.id_estado }));
    },
    aoSelecionar: (item) => { estadoSelecionadoParaOrienteId = item.__id; },
    aoCriar: async (termo) => {
        try {
            const novoEstado = await apiPost('/estados', { ds_estado: termo, id_pais: paisSelecionadoParaEstadoId });
            mostrarSucesso(`Estado "${novoEstado.ds_estado}" cadastrado.`);
            carregarTabelaEstados();
            return { ...novoEstado, __id: novoEstado.id_estado };
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
            mostrarErro('Essa localização não trouxe País/Estado. Selecione manualmente ao lado.');
            return;
        }
        try {
            const pais = await garantirPais(sugestao.pais);
            carregarTabelaPaises();

            if (!sugestao.estado) {
                document.getElementById('busca-estado-oriente').value = '';
                estadoSelecionadoParaOrienteId = null;
                mostrarErro('País identificado, mas sem Estado. Selecione o Estado manualmente ao lado.');
                return;
            }

            const estado = await garantirEstado(sugestao.estado, pais.id_pais);
            carregarTabelaEstados();

            estadoSelecionadoParaOrienteId = estado.id_estado;
            document.getElementById('busca-estado-oriente').value = estado.ds_estado;
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
                    <button type="button" class="acao-link editar" data-tipo="oriente" data-id="${o.id_oriente}">Editar</button>
                    <button type="button" class="acao-link excluir" data-tipo="oriente" data-id="${o.id_oriente}">Excluir</button>
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
                    <button type="button" class="acao-link editar" data-tipo="estado" data-id="${e.id_estado}">Editar</button>
                    <button type="button" class="acao-link excluir" data-tipo="estado" data-id="${e.id_estado}">Excluir</button>
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
                    <button type="button" class="acao-link editar" data-tipo="pais" data-id="${p.id_pais}">Editar</button>
                    <button type="button" class="acao-link excluir" data-tipo="pais" data-id="${p.id_pais}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os países.');
    }
}

// ---------- Edição / exclusão ----------

function entrarModoEdicaoPais(pais) {
    editandoIdPais = pais.id_pais;
    document.getElementById('ds_pais').value = pais.ds_pais;
    document.getElementById('titulo-pais').textContent = 'Editar País';
    document.getElementById('botao-salvar-pais').textContent = 'Salvar edição';
    document.getElementById('botao-cancelar-pais').hidden = false;
}

function sairModoEdicaoPais() {
    editandoIdPais = null;
    document.getElementById('form-pais').reset();
    document.getElementById('titulo-pais').textContent = 'Cadastrar País';
    document.getElementById('botao-salvar-pais').textContent = 'Salvar País';
    document.getElementById('botao-cancelar-pais').hidden = true;
}

function entrarModoEdicaoEstado(estado) {
    editandoIdEstado = estado.id_estado;
    paisSelecionadoParaEstadoId = estado.id_pais || null;
    document.getElementById('ds_estado').value = estado.ds_estado;
    document.getElementById('busca-pais-estado').value = estado.ds_pais || '';
    document.getElementById('titulo-estado').textContent = 'Editar Estado';
    document.getElementById('botao-salvar-estado').textContent = 'Salvar edição';
    document.getElementById('botao-cancelar-estado').hidden = false;
}

function sairModoEdicaoEstado() {
    editandoIdEstado = null;
    paisSelecionadoParaEstadoId = null;
    document.getElementById('form-estado').reset();
    document.getElementById('titulo-estado').textContent = 'Cadastrar Estado';
    document.getElementById('botao-salvar-estado').textContent = 'Salvar Estado';
    document.getElementById('botao-cancelar-estado').hidden = true;
}

function entrarModoEdicaoOriente(oriente) {
    editandoIdOriente = oriente.id_oriente;
    estadoSelecionadoParaOrienteId = oriente.id_estado || null;
    document.getElementById('ds_oriente').value = oriente.ds_oriente;
    document.getElementById('busca-estado-oriente').value = oriente.ds_estado || '';
    document.getElementById('titulo-oriente').textContent = 'Editar Oriente';
    document.getElementById('botao-salvar-oriente').textContent = 'Salvar edição';
    document.getElementById('botao-cancelar-oriente').hidden = false;
}

function sairModoEdicaoOriente() {
    editandoIdOriente = null;
    estadoSelecionadoParaOrienteId = null;
    document.getElementById('form-oriente').reset();
    document.getElementById('titulo-oriente').textContent = 'Cadastrar Oriente';
    document.getElementById('botao-salvar-oriente').textContent = 'Salvar Oriente';
    document.getElementById('botao-cancelar-oriente').hidden = true;
}

async function tratarCliqueAcao(evento, { cache, chaveId, buscar, remover, entrarEdicao, mensagemExcluir }) {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const item = cache.find(i => i[chaveId] == botaoEditar.dataset.id);
        if (item) entrarEdicao(item);
        return true;
    }

    if (botaoExcluir) {
        if (!confirm(mensagemExcluir)) return true;
        try {
            await remover(botaoExcluir.dataset.id);
            await buscar();
        } catch (erro) {
            mostrarErro(erro.message);
        }
        return true;
    }

    return false;
}

document.getElementById('corpo-tabela-pais').addEventListener('click', (evento) => {
    tratarCliqueAcao(evento, {
        cache: paisesCache,
        chaveId: 'id_pais',
        buscar: carregarTabelaPaises,
        remover: async (id) => {
            await apiDelete(`/paises/${id}`);
            mostrarSucesso('País excluído com sucesso.');
            if (editandoIdPais == id) sairModoEdicaoPais();
        },
        entrarEdicao: entrarModoEdicaoPais,
        mensagemExcluir: 'Tem certeza que deseja excluir este País?'
    });
});

document.getElementById('corpo-tabela-estado').addEventListener('click', (evento) => {
    tratarCliqueAcao(evento, {
        cache: estadosCache,
        chaveId: 'id_estado',
        buscar: carregarTabelaEstados,
        remover: async (id) => {
            await apiDelete(`/estados/${id}`);
            mostrarSucesso('Estado excluído com sucesso.');
            if (editandoIdEstado == id) sairModoEdicaoEstado();
        },
        entrarEdicao: entrarModoEdicaoEstado,
        mensagemExcluir: 'Tem certeza que deseja excluir este Estado?'
    });
});

document.getElementById('corpo-tabela-oriente').addEventListener('click', (evento) => {
    tratarCliqueAcao(evento, {
        cache: orientesCache,
        chaveId: 'id_oriente',
        buscar: carregarTabelaOrientes,
        remover: async (id) => {
            await apiDelete(`/orientes/${id}`);
            mostrarSucesso('Oriente excluído com sucesso.');
            if (editandoIdOriente == id) sairModoEdicaoOriente();
        },
        entrarEdicao: entrarModoEdicaoOriente,
        mensagemExcluir: 'Tem certeza que deseja excluir este Oriente?'
    });
});

document.getElementById('botao-cancelar-pais').addEventListener('click', sairModoEdicaoPais);
document.getElementById('botao-cancelar-estado').addEventListener('click', sairModoEdicaoEstado);
document.getElementById('botao-cancelar-oriente').addEventListener('click', sairModoEdicaoOriente);

// ---------- Formulários ----------

document.getElementById('form-pais').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_pais = document.getElementById('ds_pais').value.trim();
    if (!ds_pais) return;
    try {
        if (editandoIdPais) {
            await apiPut(`/paises/${editandoIdPais}`, { ds_pais });
            mostrarSucesso('País atualizado com sucesso.');
        } else {
            await apiPost('/paises', { ds_pais });
            mostrarSucesso('País cadastrado com sucesso.');
        }
        sairModoEdicaoPais();
        carregarTabelaPaises();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

document.getElementById('form-estado').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_estado = document.getElementById('ds_estado').value.trim();
    if (!ds_estado) return;
    try {
        if (editandoIdEstado) {
            await apiPut(`/estados/${editandoIdEstado}`, { ds_estado, id_pais: paisSelecionadoParaEstadoId });
            mostrarSucesso('Estado atualizado com sucesso.');
        } else {
            await apiPost('/estados', { ds_estado, id_pais: paisSelecionadoParaEstadoId });
            mostrarSucesso('Estado cadastrado com sucesso.');
        }
        sairModoEdicaoEstado();
        carregarTabelaEstados();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

document.getElementById('form-oriente').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_oriente = document.getElementById('ds_oriente').value.trim();
    if (!ds_oriente) return;
    try {
        if (editandoIdOriente) {
            await apiPut(`/orientes/${editandoIdOriente}`, { ds_oriente, id_estado: estadoSelecionadoParaOrienteId });
            mostrarSucesso('Oriente atualizado com sucesso.');
        } else {
            await apiPost('/orientes', { ds_oriente, id_estado: estadoSelecionadoParaOrienteId });
            mostrarSucesso('Oriente cadastrado com sucesso.');
        }
        sairModoEdicaoOriente();
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabelaOrientes();
carregarTabelaEstados();
carregarTabelaPaises();
