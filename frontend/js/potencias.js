exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'potencias', titulo: 'Potências', breadcrumb: 'Início / Potências' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');

let potenciasCache = [];
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

function entrarModoEdicao(potencia) {
    editandoId = potencia.id_potencia;
    document.getElementById('nome').value = potencia.nome;
    tituloFormulario.textContent = 'Editar Potência';
    botaoSalvar.textContent = 'Salvar edição';
    botaoCancelar.hidden = false;
}

function sairModoEdicao() {
    editandoId = null;
    document.getElementById('form-potencia').reset();
    tituloFormulario.textContent = 'Cadastrar Potência';
    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.hidden = true;
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        potenciasCache = await apiGet('/potencias');
        if (!potenciasCache.length) {
            corpo.innerHTML = `<tr><td colspan="3" class="vazio">Nenhuma potência cadastrada</td></tr>`;
            return;
        }
        corpo.innerHTML = potenciasCache.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.dt_criacao ? new Date(p.dt_criacao).toLocaleDateString('pt-BR') : ''}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${p.id_potencia}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${p.id_potencia}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar as potências. Verifique se a API está em execução.');
    }
}

document.getElementById('corpo-tabela').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const potencia = potenciasCache.find(p => p.id_potencia == botaoEditar.dataset.id);
        if (potencia) entrarModoEdicao(potencia);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir esta Potência?')) return;
        try {
            await apiDelete(`/potencias/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Potência excluída com sucesso.');
            if (editandoId == botaoExcluir.dataset.id) sairModoEdicao();
            carregarTabela();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('botao-cancelar').addEventListener('click', sairModoEdicao);

document.getElementById('form-potencia').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    if (!nome) return;
    try {
        if (editandoId) {
            await apiPut(`/potencias/${editandoId}`, { nome });
            mostrarSucesso('Potência atualizada com sucesso.');
        } else {
            await apiPost('/potencias', { nome });
            mostrarSucesso('Potência cadastrada com sucesso.');
        }
        sairModoEdicao();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabela();
