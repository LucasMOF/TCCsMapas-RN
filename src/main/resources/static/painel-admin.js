let tccsGlobais = []; // Guarda os TCCs na memória para exibir no Modal

document.addEventListener('DOMContentLoaded', () => {
    carregarPendentes();
});

async function carregarPendentes() {
    try {
        const response = await fetch('/api/tccs/pendentes');

        if (!response.ok) throw new Error('Erro ao buscar pendentes');

        tccsGlobais = await response.json();
        renderizarTabela(tccsGlobais);
    } catch (error) {
        console.error(error);
        alert('Falha ao carregar os TCCs pendentes.');
    }
}

function renderizarTabela(tccs) {
    const tbody = document.getElementById('tabela-pendentes');
    const msgVazio = document.getElementById('msg-vazio');

    tbody.innerHTML = '';

    if (tccs.length === 0) {
        msgVazio.style.display = 'block';
        return;
    }

    msgVazio.style.display = 'none';

    tccs.forEach(tcc => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <strong>${tcc.titulo}</strong><br>
                <small style="color: #94a3b8;">Orientador: ${tcc.orientador}</small>
            </td>
            <td>${tcc.discente}</td>
            <td>
                ${tcc.municipio}<br>
                <small style="color: #94a3b8;">${tcc.mesorregiao}</small>
            </td>
            <td>
                <button class="btn-detalhes" onclick="abrirModal(${tcc.id})">Ver Detalhes</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function abrirModal(id) {
    // Busca o TCC específico na nossa lista global
    const tcc = tccsGlobais.find(t => t.id === id);
    if (!tcc) return;

    const modal = document.getElementById('modal-detalhes');
    const corpo = document.getElementById('conteudo-modal');
    const rodape = document.getElementById('rodape-modal');

    // Monta todos os dados do TCC para a revisão completa
    corpo.innerHTML = `
        <div class="detalhe-grupo">
            <label>Título</label>
            <p>${tcc.titulo}</p>
        </div>
        <div class="detalhe-grupo">
            <label>Autoria e Orientação</label>
            <p><strong>Discente:</strong> ${tcc.discente} <br> <strong>Orientador:</strong> ${tcc.orientador}</p>
        </div>
        <div class="detalhe-grupo">
            <label>Banca Examinadora</label>
            <p>${tcc.examinador1 || 'Não informado'} / ${tcc.examinador2 || 'Não informado'}</p>
        </div>
        <div class="detalhe-grupo">
            <label>Data / E-Mail</label>
            <p>${tcc.data || 'Não informado'} / ${tcc.email || 'Não informado'}</p>
        </div>
        <div class="detalhe-grupo">
            <label>Localidade: Município - Microrregião (Mesorregão)</label>
            <p>${tcc.municipio} - ${tcc.microrregiao} (${tcc.mesorregiao})</p>
        </div>
        
        <!-- Link clicável para abrir o PDF em nova aba (corrigido para urlPdf) -->
        ${tcc.urlPdf ? `<a href="${tcc.urlPdf}" target="_blank" class="btn-pdf">📄 Abrir Arquivo PDF</a>` : '<p style="color: #f87171;">⚠️ Nenhum arquivo em anexo.</p>'}
    `;

    // Monta os botões de ação dentro do modal
    rodape.innerHTML = `
        <button class="btn-rejeitar" onclick="avaliarTcc(${tcc.id}, 'REJEITAR')">Rejeitar Cadastro</button>
        <button class="btn-aprovar" onclick="avaliarTcc(${tcc.id}, 'APROVAR')">Aprovar e Publicar</button>
    `;

    modal.style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-detalhes').style.display = 'none';
}

async function avaliarTcc(id, acao) {
    const confirmacao = confirm(`Tem certeza que deseja ${acao} este TCC?`);
    if (!confirmacao) return;

    try {
        const url = `/api/tccs/${id}/${acao.toLowerCase()}`;
        const response = await fetch(url, { method: 'PUT' });

        if (response.ok) {
            fecharModal();
            carregarPendentes(); // Atualiza a tabela na hora
        } else {
            alert(`Erro ao ${acao.toLowerCase()} o TCC.`);
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão com o servidor.');
    }
}