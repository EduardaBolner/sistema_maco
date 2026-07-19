async function buscarLocalizacoes(termo) {
    if (!termo || !termo.trim()) return [];
    return apiGet(`/geo/autocomplete?input=${encodeURIComponent(termo.trim())}`);
}

async function garantirPais(nomePais) {
    const paises = await apiGet('/paises');
    const existente = paises.find(p => p.ds_pais.toLowerCase() === nomePais.toLowerCase());
    if (existente) return existente;
    return apiPost('/paises', { ds_pais: nomePais });
}

async function garantirEstado(nomeEstado, idPais) {
    const estados = await apiGet(`/estados${idPais ? `?id_pais=${idPais}` : ''}`);
    const existente = estados.find(e => e.ds_estado.toLowerCase() === nomeEstado.toLowerCase());
    if (existente) return existente;
    return apiPost('/estados', { ds_estado: nomeEstado, id_pais: idPais || null });
}

function configurarBuscaLocalizacao({ input, lista, aoResolver }) {
    let timeout = null;

    function fechar() {
        lista.classList.remove('aberta');
    }

    function abrir() {
        lista.classList.add('aberta');
    }

    function renderizar(sugestoes) {
        lista.innerHTML = '';
        if (!sugestoes.length) {
            const div = document.createElement('div');
            div.className = 'combo-item';
            div.textContent = 'Nenhuma localização encontrada';
            lista.appendChild(div);
            abrir();
            return;
        }
        sugestoes.forEach((sugestao) => {
            const div = document.createElement('div');
            div.className = 'combo-item';
            div.textContent = sugestao.descricao;
            div.addEventListener('click', async () => {
                input.value = sugestao.cidade;
                fechar();
                await aoResolver(sugestao);
            });
            lista.appendChild(div);
        });
        abrir();
    }

    input.addEventListener('input', () => {
        const termo = input.value.trim();
        clearTimeout(timeout);
        if (!termo) { fechar(); return; }
        timeout = setTimeout(async () => {
            const sugestoes = await buscarLocalizacoes(termo);
            renderizar(sugestoes);
        }, 400);
    });

    document.addEventListener('click', (evento) => {
        if (!lista.contains(evento.target) && evento.target !== input) fechar();
    });
}
