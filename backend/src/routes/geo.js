const express = require('express');

const router = express.Router();

// Nominatim (OpenStreetMap) é gratuito e não exige chave, mas pede que a aplicação
// se identifique via User-Agent e evite mais de ~1 requisição por segundo.
const USER_AGENT = 'SistemaCadastrosGrandeLojaRS/1.0';

function extrairEnderecoresult(resultado) {
    const endereco = resultado.address || {};
    const cidade = endereco.city || endereco.town || endereco.village
        || endereco.municipality || endereco.county || null;
    return {
        id: resultado.place_id,
        descricao: resultado.display_name,
        cidade,
        estado: endereco.state || null,
        pais: endereco.country || null
    };
}

router.get('/autocomplete', async (req, res, next) => {
    try {
        const { input } = req.query;
        if (!input || !input.trim()) {
            return res.json([]);
        }

        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', input.trim());
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('accept-language', 'pt-BR');
        url.searchParams.set('limit', '8');

        const resposta = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT }
        });

        if (!resposta.ok) {
            return res.status(502).json({ erro: 'Não foi possível buscar a localização agora.' });
        }

        const resultados = await resposta.json();
        const sugestoes = resultados
            .map(extrairEnderecoresult)
            .filter(s => s.cidade);

        res.json(sugestoes);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
