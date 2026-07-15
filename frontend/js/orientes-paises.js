exigirAutenticacao();
renderizarShell({ ativo: 'orientes', titulo: 'Oriente / País', breadcrumb: 'Início / Oriente e País' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
let paisSelecionadoId = null;

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

configurarCombo({
    input: document.getElementById('busca-pais'),
    lista: document.getElementById('lista-pais'),
    permitirCriar: true,
    obterRotulo: (item) => item.ds_pais,
    buscar: async (termo) => {
        const paises = await apiGet('/paises');
        const filtrados = paises
            .filter(p => p.ds_pais.toLowerCase().includes(termo.toLowerCase()))
            .map(p => ({ ...p, __id: p.id_pais }));
        return filtrados;
    },
    aoSelecionar: (item) => { paisSelecionadoId = item.__id; },
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

async function carregarTabelaOrientes() {
    const corpo = document.getElementById('corpo-tabela-oriente');
    try {
        const orientes = await apiGet('/orientes');
        if (!orientes.length) {
            corpo.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum oriente cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = orientes.map(o => `
            <tr>
                <td>${o.ds_oriente}</td>
                <td>${o.ds_pais || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os orientes. Verifique se a API está em execução.');
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

document.getElementById('form-oriente').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const ds_oriente = document.getElementById('ds_oriente').value.trim();
    if (!ds_oriente) return;
    try {
        await apiPost('/orientes', { ds_oriente, id_pais: paisSelecionadoId });
        mostrarSucesso('Oriente cadastrado com sucesso.');
        document.getElementById('form-oriente').reset();
        paisSelecionadoId = null;
        carregarTabelaOrientes();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabelaOrientes();
carregarTabelaPaises();
