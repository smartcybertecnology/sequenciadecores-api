// api/api.js
// 🛑 Implementação da Lógica da API no Vercel (Node.js/Serverless)

const CORES_JOGO = ['#ff4d4d', '#4d79ff', '#4dff4d', '#ffff4d']; // Vermelho, Azul, Verde, Amarelo

// 🛑 Configurações de Dificuldade da Lógica (MANTIDA EM AMBOS OS LADOS PARA VERIFICAÇÃO)
const CONFIGS_DIFICULDADE = {
    facil: { sequenciaMin: 3, sequenciaMax: 4 },
    normal: { sequenciaMin: 4, sequenciaMax: 5 },
    dificil: { sequenciaMin: 5, sequenciaMax: 6 }
};

// Domínio permitido para CORS
const DOMINIO_PERMITIDO = 'https://playjogosgratis.com';
const DOMINIO_PERMITIDO_HTTPS = 'https://playjogosgratis.com';
const DOMINIO_PERMITIDO_SEM_HTTPS = 'playjogosgratis.com';

// Função auxiliar para gerar a sequência
function gerarSequencia(nivel, dificuldade) {
    const config = CONFIGS_DIFICULDADE[dificuldade] || CONFIGS_DIFICULDADE.normal;
    
    // Aumenta o comprimento em 1 a cada 2 níveis (exemplo)
    const aumentoNivel = Math.floor(nivel / 2); 
    
    // O comprimento final da sequência será o mínimo da configuração + aumento do nível
    let comprimento = config.sequenciaMin + aumentoNivel;
    
    // Garante que o comprimento não exceda um limite máximo (ex: 15)
    comprimento = Math.min(comprimento, 15); 

    const sequencia = [];
    for (let i = 0; i < comprimento; i++) {
        const corAleatoria = CORES_JOGO[Math.floor(Math.random() * CORES_JOGO.length)];
        sequencia.push(corAleatoria);
    }

    return sequencia;
}

module.exports = (req, res) => {
    const { method, headers, query } = req;
    
    // 1. TRATAMENTO DO CORS E DOMÍNIO
    const origin = headers.origin || headers.host;
    const isLocalhost = headers.host && headers.host.includes('localhost');

    // 🛑 Permitir o domínio exato OU localhost para testes
    if (origin && (origin.includes(DOMINIO_PERMITIDO_SEM_HTTPS) || isLocalhost)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin) {
        // Se a origem for diferente, loga e não permite (mas evita falha no Vercel)
        console.log(`Requisição de Origem Bloqueada: ${origin}`);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. TRATAMENTO DE REQUISIÇÃO OPTIONS (Pré-voo do CORS)
    if (method === 'OPTIONS') {
        res.writeHead(204); // Resposta de sucesso sem conteúdo
        res.end();
        return;
    }

    // 3. LÓGICA PRINCIPAL (GET)
    if (method === 'GET') {
        const nivel = parseInt(query.nivel) || 1;
        const dificuldade = query.dificuldade || 'normal';

        if (!CONFIGS_DIFICULDADE[dificuldade]) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Dificuldade inválida' }));
            return;
        }

        const sequencia = gerarSequencia(nivel, dificuldade);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            sequencia: sequencia, 
            nivel: nivel,
            dificuldade: dificuldade,
            comprimento: sequencia.length
        }));
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método não permitido' }));
    }
};
