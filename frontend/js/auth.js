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

function definirSessao({ token, nome, papel }) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token, nome, papel }));
}

function obterToken() {
    const sessao = obterSessao();
    return sessao ? sessao.token : null;
}

function obterUsuarioLogado() {
    const sessao = obterSessao();
    return sessao ? { nome: sessao.nome } : null;
}

function obterPapel() {
    const sessao = obterSessao();
    return sessao ? sessao.papel : null;
}

function ehAdmin() {
    return obterPapel() === 'admin';
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

function exigirAdminNoFrontend() {
    if (!ehAdmin()) {
        window.location.href = 'quadro-membros.html';
    }
}
