const CHAVE_SESSAO = 'sm_sessao';

function obterSessao() {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;
    try {
        return JSON.parse(bruto);
    } catch (e) {
        return null;
    }
}

function definirSessao({ token, nome }) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token, nome }));
}

function obterToken() {
    const sessao = obterSessao();
    return sessao ? sessao.token : null;
}

function obterUsuarioLogado() {
    const sessao = obterSessao();
    return sessao ? { nome: sessao.nome } : null;
}

function encerrarSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.href = 'index.html';
}

function exigirAutenticacao() {
    if (!obterToken()) {
        window.location.href = 'index.html';
    }
}
