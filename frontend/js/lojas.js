exigirAutenticacao();
renderizarShell({ ativo: 'lojas', titulo: 'Lojas', breadcrumb: 'Início / Lojas' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
let debounceBusca = null;

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

async function carregarSelects() {
    try {
        const [potencias, orientes, ritos] = await Promise.all([
            apiGet('/potencias'), apiGet('/orientes'), apiGet('/ritos')
        ]);

        const selectPotencia = document.getElementById('id_potencia');
        potencias.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id_potencia;
            option.textContent = p.nome;
            selectPotencia.appendChild(option);
        });

        const selectOriente = document.getElementById('id_oriente');
        orientes.forEach(o => {
            const option = document.createElement('option');
            option.value = o.id_oriente;
            option.textContent = o.ds_oriente;
            selectOriente.appendChild(option);
        });

        const selectRitu = document.getElementById('id_ritu');
        ritos.forEach(r => {
            const option = document.createElement('option');
            option.value = r.id_ritu;
            option.textContent = r.ds_ritu;
            selectRitu.appendChild(option);
        });
    } catch (erro) {
        mostrarErro('Não foi possível carregar potências, orientes e ritos.');
    }
}

async function carregarTabela(nome) {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const query = nome ? `?nome=${encodeURIComponent(nome)}` : '';
        const lojas = await apiGet(`/lojas${query}`);
        if (!lojas.length) {
            corpo.innerHTML = `<tr><td colspan="5" class="vazio">Nenhuma loja encontrada</td></tr>`;
            return;
        }
        corpo.innerHTML = lojas.map(l => `
            <tr>
                <td>${l.ds_loja}</td>
                <td>${l.nm_veneravel || '—'}</td>
                <td>${l.nome_potencia || '—'}</td>
                <td>${l.ds_oriente || '—'}</td>
                <td>${l.ds_ritu || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar as lojas. Verifique se a API está em execução.');
    }
}

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
        id_potencia: document.getElementById('id_potencia').value || null,
        id_oriente: document.getElementById('id_oriente').value || null,
        id_ritu: document.getElementById('id_ritu').value || null,
        ds_endereco: document.getElementById('ds_endereco').value.trim() || null
    };

    try {
        await apiPost('/lojas', dados);
        mostrarSucesso('Loja cadastrada com sucesso.');
        document.getElementById('form-loja').reset();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarSelects();
carregarTabela();
