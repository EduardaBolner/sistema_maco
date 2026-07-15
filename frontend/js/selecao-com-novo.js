async function popularSelect(select, itens, valueKey, labelKey) {
    select.innerHTML = '<option value="">Selecione...</option>' +
        itens.map(i => `<option value="${i[valueKey]}">${i[labelKey]}</option>`).join('');
}

function configurarSelecaoComNovo({ select, botaoNovo, miniForm, inputNome, botaoSalvar, carregarOpcoes, valueKey, labelKey, criar }) {
    botaoNovo.addEventListener('click', () => {
        if (miniForm.hasAttribute('hidden')) {
            miniForm.removeAttribute('hidden');
            inputNome.focus();
        } else {
            miniForm.setAttribute('hidden', '');
        }
    });

    botaoSalvar.addEventListener('click', async () => {
        const nome = inputNome.value.trim();
        if (!nome) return;
        const novo = await criar(nome);
        if (!novo) return;
        const itens = await carregarOpcoes();
        await popularSelect(select, itens, valueKey, labelKey);
        select.value = novo[valueKey];
        inputNome.value = '';
        miniForm.setAttribute('hidden', '');
    });
}
