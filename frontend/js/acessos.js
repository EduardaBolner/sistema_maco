exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'acessos', titulo: 'Acessos', breadcrumb: 'Início / Acessos' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const buscaMacom = document.getElementById('busca-macom');

let usuariosCache = [];
let macomSelecionadoId = null;
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

configurarCombo({
    input: buscaMacom,
    lista: document.getElementById('lista-macom'),
    permitirCriar: false,
    obterRotulo: (item) => `${item.nm_macom} (CIM ${item.cim})`,
    buscar: async (termo) => {
        const macons = await apiGet(`/macons?nome=${encodeURIComponent(termo)}`);
        return macons.map(m => ({ ...m, __id: m.id_macom }));
    },
    aoSelecionar: (item) => { macomSelecionadoId = item.__id; }
});

function entrarModoEdicao(usuario) {
    editandoId = usuario.id_usuario;
    document.getElementById('login').value = usuario.login;
    document.getElementById('senha').value = '';
    document.getElementById('papel').value = usuario.papel;
    macomSelecionadoId = usuario.id_macom || null;
    buscaMacom.value = usuario.id_macom ? `${usuario.nm_usuario} (CIM ${usuario.cim})` : usuario.nm_usuario;
    tituloFormulario.textContent = 'Editar acesso';
    botaoSalvar.textContent = 'Salvar edição';
    botaoCancelar.hidden = false;
}

function sairModoEdicao() {
    editandoId = null;
    macomSelecionadoId = null;
    document.getElementById('form-acesso').reset();
    tituloFormulario.textContent = 'Conceder acesso a um Maçom';
    botaoSalvar.textContent = 'Salvar acesso';
    botaoCancelar.hidden = true;
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        usuariosCache = await apiGet('/usuarios');
        if (!usuariosCache.length) {
            corpo.innerHTML = `<tr><td colspan="5" class="vazio">Nenhum acesso cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = usuariosCache.map(u => `
            <tr>
                <td>${u.nm_usuario}</td>
                <td>${u.login}</td>
                <td>${u.cim || '—'}</td>
                <td>${u.papel === 'admin' ? 'Administrador' : 'Usuário comum'}</td>
                <td class="acoes-tabela">
                    <button type="button" class="acao-link editar" data-id="${u.id_usuario}">Editar</button>
                    <button type="button" class="acao-link excluir" data-id="${u.id_usuario}">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os acessos. Verifique se a API está em execução.');
    }
}

document.getElementById('corpo-tabela').addEventListener('click', async (evento) => {
    const botaoEditar = evento.target.closest('.editar');
    const botaoExcluir = evento.target.closest('.excluir');

    if (botaoEditar) {
        const usuario = usuariosCache.find(u => u.id_usuario == botaoEditar.dataset.id);
        if (usuario) entrarModoEdicao(usuario);
        return;
    }

    if (botaoExcluir) {
        if (!confirm('Tem certeza que deseja excluir este acesso?')) return;
        try {
            await apiDelete(`/usuarios/${botaoExcluir.dataset.id}`);
            mostrarSucesso('Acesso excluído com sucesso.');
            if (editandoId == botaoExcluir.dataset.id) sairModoEdicao();
            carregarTabela();
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

document.getElementById('botao-cancelar').addEventListener('click', sairModoEdicao);

document.getElementById('form-acesso').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;
    const papel = document.getElementById('papel').value;

    if (!login) return;
    if (!editandoId && !senha) {
        mostrarErro('Informe uma senha para o novo acesso.');
        return;
    }
    if (!macomSelecionadoId) {
        mostrarErro('Busque e selecione um Maçom já cadastrado.');
        return;
    }

    const dados = { id_macom: macomSelecionadoId, login, papel };
    if (senha) dados.senha = senha;

    try {
        if (editandoId) {
            await apiPut(`/usuarios/${editandoId}`, dados);
            mostrarSucesso('Acesso atualizado com sucesso.');
        } else {
            await apiPost('/usuarios', dados);
            mostrarSucesso('Acesso cadastrado com sucesso.');
        }
        sairModoEdicao();
        carregarTabela();
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

carregarTabela();
