exigirAutenticacao();
renderizarShell({ ativo: 'quadro', titulo: 'Quadro de Membros', breadcrumb: 'Início / Quadro de Membros' });

const alertaErro = document.getElementById('alerta-erro');

function mostrarErro(mensagem) {
    alertaErro.textContent = mensagem;
    alertaErro.classList.add('mostrar');
}

async function carregarQuadro() {
    const corpo = document.getElementById('corpo-tabela');
    try {
        const macons = await apiGet('/macons');
        if (!macons.length) {
            corpo.innerHTML = `<tr><td colspan="9" class="vazio">Nenhum membro cadastrado</td></tr>`;
            return;
        }
        corpo.innerHTML = macons.map(m => `
            <tr>
                <td>${m.cim}</td>
                <td>${m.nm_macom}</td>
                <td>${m.ds_loja || '—'}</td>
                <td>${m.ds_ritu || '—'}</td>
                <td>${m.ds_grau || '—'}</td>
                <td>${m.nome_potencia || '—'}</td>
                <td>${m.ds_oriente || '—'}</td>
                <td>${m.ds_estado || '—'}</td>
                <td>${m.ds_pais || '—'}</td>
            </tr>
        `).join('');
    } catch (erro) {
        mostrarErro('Não foi possível carregar o quadro de membros. Verifique se a API está em execução.');
    }
}

carregarQuadro();
