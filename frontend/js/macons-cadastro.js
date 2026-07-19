exigirAutenticacao();
exigirAdminNoFrontend();
renderizarShell({ ativo: 'macons', titulo: 'Cadastrar Maçom', breadcrumb: 'Início / Maçons / Cadastrar' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const campoCim = document.getElementById('campo-cim');
const selectGrau = document.getElementById('id_grau');
const buscaLoja = document.getElementById('busca-loja');
const subpainelNovaLoja = document.getElementById('subpainel-nova-loja');

const selectPotencia = document.getElementById('select-potencia');
const selectRito = document.getElementById('select-rito');
const selectOriente = document.getElementById('select-oriente');
const selectEstadoNoOriente = document.getElementById('select-estado-no-oriente');
const selectPaisNoEstado = document.getElementById('select-pais-no-estado');

let lojaSelecionadaId = null;
const idEdicao = new URLSearchParams(window.location.search).get('id');

function formatarDataParaInput(valor) {
    return valor ? valor.slice(0, 10) : '';
}

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

async function carregarGrausDaLoja(idRitu) {
    selectGrau.innerHTML = '';
    if (!idRitu) {
        selectGrau.disabled = true;
        selectGrau.innerHTML = '<option value="">Esta loja ainda não possui um Rito definido</option>';
        return;
    }
    try {
        const graus = await apiGet(`/graus?id_ritu=${idRitu}`);
        if (!graus.length) {
            selectGrau.disabled = true;
            selectGrau.innerHTML = '<option value="">Nenhum grau cadastrado para o Rito desta Loja</option>';
            return;
        }
        selectGrau.disabled = false;
        selectGrau.innerHTML = '<option value="">Selecione...</option>' +
            graus.map(g => `<option value="${g.id_grau}">${g.ds_grau}</option>`).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os graus da Loja selecionada.');
    }
}

// ---------- Busca de Loja (com abertura do subpainel de criação) ----------

configurarCombo({
    input: buscaLoja,
    lista: document.getElementById('lista-loja'),
    permitirCriar: true,
    obterRotulo: (item) => item.ds_loja,
    buscar: async (termo) => {
        const lojas = await apiGet(`/lojas?nome=${encodeURIComponent(termo)}`);
        return lojas.map(l => ({ ...l, __id: l.id_loja }));
    },
    aoSelecionar: (item) => {
        lojaSelecionadaId = item.__id;
        subpainelNovaLoja.setAttribute('hidden', '');
        carregarGrausDaLoja(item.id_ritu);
    },
    aoCriar: async (termo) => {
        document.getElementById('nova-loja-nome').value = termo;
        subpainelNovaLoja.removeAttribute('hidden');
        return null;
    }
});

// ---------- Seleções com criação rápida (Potência, Rito, País, Estado, Oriente) ----------

configurarSelecaoComNovo({
    select: selectPotencia,
    botaoNovo: document.getElementById('btn-nova-potencia'),
    miniForm: document.getElementById('mini-potencia'),
    inputNome: document.getElementById('input-nova-potencia'),
    botaoSalvar: document.getElementById('salvar-nova-potencia'),
    valueKey: 'id_potencia', labelKey: 'nome',
    carregarOpcoes: () => apiGet('/potencias'),
    criar: async (nome) => {
        try {
            return await apiPost('/potencias', { nome });
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

configurarSelecaoComNovo({
    select: selectRito,
    botaoNovo: document.getElementById('btn-novo-rito'),
    miniForm: document.getElementById('mini-rito'),
    inputNome: document.getElementById('input-novo-rito'),
    botaoSalvar: document.getElementById('salvar-novo-rito'),
    valueKey: 'id_ritu', labelKey: 'ds_ritu',
    carregarOpcoes: () => apiGet('/ritos'),
    criar: async (nome) => {
        try {
            return await apiPost('/ritos', { ds_ritu: nome });
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

configurarSelecaoComNovo({
    select: selectPaisNoEstado,
    botaoNovo: document.getElementById('btn-novo-pais'),
    miniForm: document.getElementById('mini-pais'),
    inputNome: document.getElementById('input-novo-pais'),
    botaoSalvar: document.getElementById('salvar-novo-pais'),
    valueKey: 'id_pais', labelKey: 'ds_pais',
    carregarOpcoes: () => apiGet('/paises'),
    criar: async (nome) => {
        try {
            return await apiPost('/paises', { ds_pais: nome });
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

configurarSelecaoComNovo({
    select: selectEstadoNoOriente,
    botaoNovo: document.getElementById('btn-novo-estado'),
    miniForm: document.getElementById('mini-estado'),
    inputNome: document.getElementById('input-novo-estado'),
    botaoSalvar: document.getElementById('salvar-novo-estado'),
    valueKey: 'id_estado', labelKey: 'ds_estado',
    carregarOpcoes: () => apiGet('/estados'),
    criar: async (nome) => {
        try {
            return await apiPost('/estados', { ds_estado: nome, id_pais: selectPaisNoEstado.value || null });
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

configurarSelecaoComNovo({
    select: selectOriente,
    botaoNovo: document.getElementById('btn-novo-oriente'),
    miniForm: document.getElementById('mini-oriente'),
    inputNome: document.getElementById('input-novo-oriente'),
    botaoSalvar: document.getElementById('salvar-novo-oriente'),
    valueKey: 'id_oriente', labelKey: 'ds_oriente',
    carregarOpcoes: () => apiGet('/orientes'),
    criar: async (nome) => {
        try {
            return await apiPost('/orientes', { ds_oriente: nome, id_estado: selectEstadoNoOriente.value || null });
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
});

// ---------- Busca de localização real (Nominatim) para o Oriente da Nova Loja ----------

configurarBuscaLocalizacao({
    input: document.getElementById('input-novo-oriente'),
    lista: document.getElementById('lista-cidade-geo-loja'),
    aoResolver: async (sugestao) => {
        if (!sugestao.pais) {
            mostrarErro('Essa localização não trouxe País/Estado. Selecione manualmente abaixo.');
            return;
        }
        try {
            const pais = await garantirPais(sugestao.pais);
            popularSelect(selectPaisNoEstado, await apiGet('/paises'), 'id_pais', 'ds_pais');
            selectPaisNoEstado.value = pais.id_pais;

            if (!sugestao.estado) {
                mostrarErro('País identificado, mas sem Estado. Selecione o Estado manualmente abaixo.');
                return;
            }

            const estado = await garantirEstado(sugestao.estado, pais.id_pais);
            popularSelect(selectEstadoNoOriente, await apiGet('/estados'), 'id_estado', 'ds_estado');
            selectEstadoNoOriente.value = estado.id_estado;

            mostrarSucesso(`Localização encontrada: ${estado.ds_estado} / ${pais.ds_pais} (preenchidos automaticamente).`);
        } catch (erro) {
            mostrarErro(erro.message);
        }
    }
});

async function carregarSelecoesIniciais() {
    const [potencias, ritos, orientes, estados, paises] = await Promise.all([
        apiGet('/potencias'), apiGet('/ritos'), apiGet('/orientes'), apiGet('/estados'), apiGet('/paises')
    ]);
    popularSelect(selectPotencia, potencias, 'id_potencia', 'nome');
    popularSelect(selectRito, ritos, 'id_ritu', 'ds_ritu');
    popularSelect(selectOriente, orientes, 'id_oriente', 'ds_oriente');
    popularSelect(selectEstadoNoOriente, estados, 'id_estado', 'ds_estado');
    popularSelect(selectPaisNoEstado, paises, 'id_pais', 'ds_pais');
}

document.getElementById('btn-salvar-nova-loja').addEventListener('click', async () => {
    const ds_loja = document.getElementById('nova-loja-nome').value.trim();
    if (!ds_loja) {
        mostrarErro('Informe o nome da nova Loja.');
        return;
    }

    const dados = {
        ds_loja,
        id_potencia: selectPotencia.value || null,
        id_ritu: selectRito.value || null,
        id_oriente: selectOriente.value || null,
        nm_veneravel: document.getElementById('nova-loja-veneravel').value.trim() || null,
        ds_endereco: document.getElementById('nova-loja-endereco').value.trim() || null
    };

    try {
        const novaLoja = await apiPost('/lojas', dados);
        mostrarSucesso(`Loja "${novaLoja.ds_loja}" cadastrada com sucesso.`);
        buscaLoja.value = novaLoja.ds_loja;
        buscaLoja.dataset.id = novaLoja.id_loja;
        lojaSelecionadaId = novaLoja.id_loja;
        subpainelNovaLoja.setAttribute('hidden', '');
        carregarGrausDaLoja(novaLoja.id_ritu);
    } catch (erro) {
        mostrarErro(erro.message);
    }
});

document.getElementById('btn-cancelar-nova-loja').addEventListener('click', () => {
    subpainelNovaLoja.setAttribute('hidden', '');
});

document.getElementById('form-macom').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    campoCim.classList.remove('invalido');

    const cim = document.getElementById('cim').value;
    const nm_macom = document.getElementById('nm_macom').value.trim();

    if (!cim || !nm_macom) return;

    const dados = {
        cim: Number(cim),
        nm_macom,
        id_loja: lojaSelecionadaId,
        id_grau: selectGrau.value || null,
        dt_nascimento: document.getElementById('dt_nascimento').value || null,
        dt_iniciacao: document.getElementById('dt_iniciacao').value || null,
        dt_elevacao: document.getElementById('dt_elevacao').value || null,
        dt_exaltacao: document.getElementById('dt_exaltacao').value || null,
        nr_ddd: document.getElementById('nr_ddd').value.trim() || null,
        nr_celular: document.getElementById('nr_celular').value.trim() || null,
        ds_endereco: document.getElementById('ds_endereco').value.trim() || null
    };

    try {
        if (idEdicao) {
            await apiPut(`/macons/${idEdicao}`, dados);
            mostrarSucesso('Maçom atualizado com sucesso.');
        } else {
            await apiPost('/macons', dados);
            mostrarSucesso('Maçom cadastrado com sucesso.');
            document.getElementById('form-macom').reset();
            lojaSelecionadaId = null;
            selectGrau.disabled = true;
            selectGrau.innerHTML = '<option value="">Selecione uma Loja primeiro</option>';
        }
    } catch (erro) {
        if (erro.status === 409) {
            campoCim.classList.add('invalido');
        }
        mostrarErro(erro.message);
    }
});

async function carregarMacomParaEdicao() {
    try {
        const macom = await apiGet(`/macons/${idEdicao}`);

        document.getElementById('titulo-formulario').textContent = 'Editar Maçom';
        document.getElementById('botao-salvar-macom').textContent = 'Salvar edição';
        renderizarShell({ ativo: 'macons', titulo: 'Editar Maçom', breadcrumb: 'Início / Maçons / Editar' });

        document.getElementById('cim').value = macom.cim;
        document.getElementById('nm_macom').value = macom.nm_macom;
        document.getElementById('dt_nascimento').value = formatarDataParaInput(macom.dt_nascimento);
        document.getElementById('dt_iniciacao').value = formatarDataParaInput(macom.dt_iniciacao);
        document.getElementById('dt_elevacao').value = formatarDataParaInput(macom.dt_elevacao);
        document.getElementById('dt_exaltacao').value = formatarDataParaInput(macom.dt_exaltacao);
        document.getElementById('nr_ddd').value = macom.nr_ddd || '';
        document.getElementById('nr_celular').value = macom.nr_celular || '';
        document.getElementById('ds_endereco').value = macom.ds_endereco || '';

        if (macom.id_loja) {
            lojaSelecionadaId = macom.id_loja;
            buscaLoja.value = macom.ds_loja;
            buscaLoja.dataset.id = macom.id_loja;
            await carregarGrausDaLoja(macom.id_ritu);
            selectGrau.value = macom.id_grau || '';
        }
    } catch (erro) {
        mostrarErro('Não foi possível carregar os dados deste Maçom.');
    }
}

carregarSelecoesIniciais();
if (idEdicao) {
    carregarMacomParaEdicao();
}
