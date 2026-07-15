const CHAVE_USUARIO = 'sm_usuario';

function obterUsuarioLogado() {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    if (!bruto) return null;
    try {
        return JSON.parse(bruto);
    } catch (e) {
        return null;
    }
}

function definirUsuarioLogado(nome) {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ nome }));
}

function encerrarSessao() {
    localStorage.removeItem(CHAVE_USUARIO);
    window.location.href = 'index.html';
}

function exigirAutenticacao() {
    if (!obterUsuarioLogado()) {
        window.location.href = 'index.html';
    }
}
