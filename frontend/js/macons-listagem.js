exigirAutenticacao();
renderizarShell({ ativo: 'macons', titulo: 'Maçons', breadcrumb: 'Início / Maçons' });

const alertaErro = document.getElementById('alerta-erro');
let debounceBusca = null;

function mostrarErro(mensagem) {
    alertaErro.textContent = mensagem;
    alertaErro.classList.add('mostrar');
}

function montarQuery() {
    const nome = document.getElementById('busca-nome').value.trim();
    const loja = document.getElementById('busca-loja').value.trim();
    const cim = document.getElementById('busca-cim').value.trim();

    const params = new URLSearchParams();
    if (nome) params.set('nome', nome);
    if (loja) params.set('loja', loja);
    if (cim) params.set('cim', cim);

    const query = params.toString();
    return query ? `?${query}` : '';
}

async function carregarTabela() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const macons = await apiGet(`/macons${montarQuery()}`);
        if (!macons.length) {
            corpo.innerHTML = `<tr><td colspan="5" class="vazio">Nenhum Maçom encontrado</td></tr>`;
            return;
        }
        corpo.innerHTML = macons.map(m => `
            <tr>
                <td>${m.cim}</td>
                <td>${m.nm_macom}</td>
                <td>${m.ds_loja || '—'}</td>
                <td>${m.ds_grau || '—'}</td>
                <td>${m.nr_ddd ? `(${m.nr_ddd}) ` : ''}${m.nr_celular || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar os Maçons. Verifique se a API está em execução.');
    }
}

['busca-nome', 'busca-loja', 'busca-cim'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        clearTimeout(debounceBusca);
        debounceBusca = setTimeout(carregarTabela, 300);
    });
});

carregarTabela();
