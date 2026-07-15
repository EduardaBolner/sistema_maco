const ITENS_NAVEGACAO = [
    { chave: 'inicio', rotulo: 'Início', href: 'menu.html', icone: '&#9679;' },
    { chave: 'macons', rotulo: 'Maçons', href: 'macons-listagem.html', icone: '&#10022;' },
    { chave: 'lojas', rotulo: 'Lojas', href: 'lojas.html', icone: '&#9651;' },
    { chave: 'ritos', rotulo: 'Ritos', href: 'ritos.html', icone: '&#10013;' },
    { chave: 'graus', rotulo: 'Graus', href: 'graus.html', icone: '&#9878;' },
    { chave: 'potencias', rotulo: 'Potências', href: 'potencias.html', icone: '&#9737;' },
    { chave: 'orientes', rotulo: 'Oriente / Estado / País', href: 'orientes-paises.html', icone: '&#9789;' },
    { chave: 'quadro', rotulo: 'Quadro de Membros', href: 'quadro-membros.html', icone: '&#9813;' }
];

function formatarDataHora(data) {
    return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

function renderizarShell({ ativo, titulo, breadcrumb }) {
    const usuario = obterUsuarioLogado();
    const nome = usuario ? usuario.nome : 'Visitante';

    const itensHtml = ITENS_NAVEGACAO.map(item => `
        <li>
            <a href="${item.href}" class="${item.chave === ativo ? 'ativo' : ''}">
                <span class="icone">${item.icone}</span>
                <span>${item.rotulo}</span>
            </a>
        </li>
    `).join('');

    const sidebarSlot = document.getElementById('sidebar-slot');
    if (sidebarSlot) {
        sidebarSlot.innerHTML = `
            <div class="sidebar-cabecalho">
                <img class="selo" src="${SELO_BASE64}" alt="Selo da Grande Loja Regular do Rio Grande do Sul">
                <div class="logo-texto">
                    GRANDE LOJA REGULAR<br>DO RIO GRANDE DO SUL
                </div>
            </div>
            <div class="sidebar-usuario">
                <div class="nome">${nome}</div>
                <div class="data-hora" id="relogio-sidebar"></div>
            </div>
            <div class="nav-titulo">NAVEGAÇÃO</div>
            <ul class="nav-lista">${itensHtml}</ul>
        `;
    }

    const topbarSlot = document.getElementById('topbar-slot');
    if (topbarSlot) {
        topbarSlot.innerHTML = `
            <div>
                <div class="breadcrumb">${breadcrumb || ''}</div>
                <h1>${titulo || ''}</h1>
            </div>
            <div class="topbar-direita">
                <span class="saudacao">Olá, <strong>${nome}</strong></span>
                <button class="btn btn-perigo" id="btn-sair">Sair</button>
            </div>
        `;
        const btnSair = document.getElementById('btn-sair');
        if (btnSair) {
            btnSair.addEventListener('click', encerrarSessao);
        }
    }

    const relogio = document.getElementById('relogio-sidebar');
    if (relogio) {
        const atualizar = () => { relogio.textContent = formatarDataHora(new Date()); };
        atualizar();
        setInterval(atualizar, 1000);
    }
}
