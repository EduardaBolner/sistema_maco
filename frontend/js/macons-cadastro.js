exigirAutenticacao();
renderizarShell({ ativo: 'macons', titulo: 'Cadastrar Maçom', breadcrumb: 'Início / Maçons / Cadastrar' });

const alertaErro = document.getElementById('alerta-erro');
const alertaSucesso = document.getElementById('alerta-sucesso');
const campoCim = document.getElementById('campo-cim');
const selectGrau = document.getElementById('id_grau');

let lojaSelecionadaId = null;

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

configurarCombo({
    input: document.getElementById('busca-loja'),
    lista: document.getElementById('lista-loja'),
    permitirCriar: true,
    obterRotulo: (item) => item.ds_loja,
    buscar: async (termo) => {
        const lojas = await apiGet(`/lojas?nome=${encodeURIComponent(termo)}`);
        return lojas.map(l => ({ ...l, __id: l.id_loja }));
    },
    aoSelecionar: (item) => {
        lojaSelecionadaId = item.__id;
        carregarGrausDaLoja(item.id_ritu);
    },
    aoCriar: async (termo) => {
        try {
            const novaLoja = await apiPost('/lojas', { ds_loja: termo });
            mostrarSucesso(`Loja "${novaLoja.ds_loja}" cadastrada. Complete os demais dados dela na tela de Lojas.`);
            return { ...novaLoja, __id: novaLoja.id_loja };
        } catch (erro) {
            mostrarErro(erro.message);
            return null;
        }
    }
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
        await apiPost('/macons', dados);
        mostrarSucesso('Maçom cadastrado com sucesso.');
        document.getElementById('form-macom').reset();
        lojaSelecionadaId = null;
        selectGrau.disabled = true;
        selectGrau.innerHTML = '<option value="">Selecione uma Loja primeiro</option>';
    } catch (erro) {
        if (erro.status === 409) {
            campoCim.classList.add('invalido');
        }
        mostrarErro(erro.message);
    }
});
