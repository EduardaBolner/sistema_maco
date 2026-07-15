function configurarCombo({ input, lista, buscar, obterRotulo, aoSelecionar, permitirCriar, aoCriar }) {
    let itensAtuais = [];
    let timeout = null;

    function abrir() { lista.classList.add('aberta'); }
    function fechar() { lista.classList.remove('aberta'); }

    function renderizar(itens, termo) {
        itensAtuais = itens;
        lista.innerHTML = '';

        itens.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'combo-item';
            div.textContent = obterRotulo(item);
            div.addEventListener('click', () => {
                input.value = obterRotulo(item);
                input.dataset.id = item.__id;
                fechar();
                if (aoSelecionar) aoSelecionar(item);
            });
            lista.appendChild(div);
        });

        const existeExato = itens.some(i => obterRotulo(i).toLowerCase() === termo.toLowerCase());
        if (permitirCriar && termo && !existeExato) {
            const div = document.createElement('div');
            div.className = 'combo-item criar-novo';
            div.textContent = `+ Cadastrar "${termo}"`;
            div.addEventListener('click', async () => {
                const novo = await aoCriar(termo);
                fechar();
                if (novo) {
                    input.value = obterRotulo(novo);
                    input.dataset.id = novo.__id;
                    if (aoSelecionar) aoSelecionar(novo);
                }
            });
            lista.appendChild(div);
        }

        if (itens.length === 0 && !permitirCriar) {
            const div = document.createElement('div');
            div.className = 'combo-item';
            div.textContent = 'Nenhum resultado';
            lista.appendChild(div);
        }

        abrir();
    }

    input.addEventListener('input', () => {
        delete input.dataset.id;
        const termo = input.value.trim();
        clearTimeout(timeout);
        if (!termo) { fechar(); return; }
        timeout = setTimeout(async () => {
            const itens = await buscar(termo);
            renderizar(itens, termo);
        }, 250);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim() && itensAtuais.length) abrir();
    });

    document.addEventListener('click', (evento) => {
        if (!lista.contains(evento.target) && evento.target !== input) fechar();
    });
}
