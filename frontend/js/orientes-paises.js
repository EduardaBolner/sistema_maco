exigirAutenticacao();
renderizarShell({ ativo: 'orientes', titulo: 'Oriente / Estado / País', breadcrumb: 'Início / Oriente, Estado e País' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');

let paisSelecionadoParaEstadoId = null;
let estadoSelecionadoParaOrienteId = null;

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

// ---------- Tabelas ----------

async function carregarTabelaOrientes() {
    const corpo = document.getElementById('corpo-tabela-oriente');
    try {
        const orientes = await apiGet('/orientes');
        if (!orientes.length) {
            corpo.innerHTML = `<tr><td colspan="3" class="vazio">Nenhum oriente cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = orientes.map(o => `
            <tr>
                <td>${o.ds_oriente}</td>
                <td>${o.ds_estado || '—'}</td>
                <td>${o.ds_pais || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os orientes. Verifique se a API está em execução.');
    }
}

async function carregarTabelaEstados() {
    const corpo = document.getElementById('corpo-tabela-estado');
    try {
        const estados = await apiGet('/estados');
        if (!estados.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum estado cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = estados.map(e => `
            <tr>
                <td>${e.ds_estado}</td>
                <td>${e.ds_pais || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os estados.');
    }
}

async function carregarTabelaPaises() {
    const corpo = document.getElementById('corpo-tabela-pais');
    try {
        const paises = await apiGet('/paises');
        if (!paises.length) {
            corpo.innerHTML = `<tr><td class="vazio">Nenhum país cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = paises.map(p => `<tr><td>${p.ds_pais}</td></tr>`).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os países.');
    }
}

// ---------- Formulários ----------

document.getElementById('form-pais').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_pais = document.getElementById('ds_pais').value.trim();
    if (!ds_pais) return;
    try {
        await apiPost('/paises', { ds_pais });
        mostrarSucesso('País cadastrado com sucesso.');
        document.getElementById('form-pais').reset();
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
        await apiPost('/estados', { ds_estado, id_pais: paisSelecionadoParaEstadoId });
        mostrarSucesso('Estado cadastrado com sucesso.');
        document.getElementById('form-estado').reset();
        paisSelecionadoParaEstadoId = null;
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
        await apiPost('/orientes', { ds_oriente, id_estado: estadoSelecionadoParaOrienteId });
        mostrarSucesso('Oriente cadastrado com sucesso.');
        document.getElementById('form-oriente').reset();
        estadoSelecionadoParaOrienteId = null;
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabelaOrientes();
carregarTabelaEstados();
carregarTabelaPaises();
