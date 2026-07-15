document.getElementById('selo-login').src = SELO_BASE64;

if (obterUsuarioLogado()) {
    window.location.href = 'menu.html';
}

document.getElementById('form-login').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const alerta = document.getElementById('alerta-login');

    if (!usuario || !senha) {
        alerta.textContent = 'Informe usuário e senha.';
        alerta.classList.add('mostrar');
        return;
    }

    // Autenticação apenas visual — não há validação real de credenciais.
    definirUsuarioLogado(usuario);
    window.location.href = 'menu.html';
});
