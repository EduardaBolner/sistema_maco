function cabecalhosAutenticados(extras = {}) {
    const token = obterToken();
    return token ? { ...extras, Authorization: `Bearer ${token}` } : extras;
}

async function tratarResposta(res) {
    let corpo = null;
    try {
        corpo = await res.json();
    } catch (e) {
        corpo = null;
    }

    if (res.status === 401) {
        encerrarSessao();
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!res.ok) {
        const mensagem = (corpo && corpo.erro) || `Erro ${res.status}`;
        const erro = new Error(mensagem);
        erro.status = res.status;
        throw erro;
    }
    return corpo;
}

async function apiGet(caminho) {
    const res = await fetch(`${API_BASE_URL}${caminho}`, {
        headers: cabecalhosAutenticados()
    });
    return tratarResposta(res);
}

async function apiPost(caminho, dados) {
    const res = await fetch(`${API_BASE_URL}${caminho}`, {
        method: 'POST',
        headers: cabecalhosAutenticados({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(dados)
    });
    return tratarResposta(res);
}

async function apiPut(caminho, dados) {
    const res = await fetch(`${API_BASE_URL}${caminho}`, {
        method: 'PUT',
        headers: cabecalhosAutenticados({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(dados)
    });
    return tratarResposta(res);
}

async function apiDelete(caminho) {
    const res = await fetch(`${API_BASE_URL}${caminho}`, {
        method: 'DELETE',
        headers: cabecalhosAutenticados()
    });
    return tratarResposta(res);
}
