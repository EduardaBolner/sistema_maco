async function tratarResposta(res) {
    let corpo = null;
    try {
        corpo = await res.json();
    } catch (e) {
        corpo = null;
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
    const res = await fetch(`${API_BASE_URL}${caminho}`);
    return tratarResposta(res);
}

async function apiPost(caminho, dados) {
    const res = await fetch(`${API_BASE_URL}${caminho}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return tratarResposta(res);
}
