document.getElementById('selo-login').src = SELO_BASE64;

if (obterToken()) {
    window.location.href = 'menu.html';
}

document.getElementById('form-login').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const login = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const alerta = document.getElementById('alerta-login');
    const botao = document.getElementById('botao-entrar');

    alerta.classList.remove('mostrar');

    if (!login || !senha) {
        alerta.textContent = 'Informe usuário e senha.';
        alerta.classList.add('mostrar');
        return;
    }

    botao.disabled = true;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        });
        const corpo = await res.json().catch(() => null);

        if (!res.ok) {
            alerta.textContent = (corpo && corpo.erro) || 'Não foi possível entrar.';
            alerta.classList.add('mostrar');
            return;
        }

        definirSessao({ token: corpo.token, nome: corpo.nome });
        window.location.href = 'menu.html';
    } catch (erro) {
        alerta.textContent = 'Não foi possível conectar à API. Verifique se o servidor está em execução.';
        alerta.classList.add('mostrar');
    } finally {
        botao.disabled = false;
    }
});
