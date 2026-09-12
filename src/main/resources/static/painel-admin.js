let tccsGlobais = [];
let tccIdEmAvaliacao = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarPendentes();
    configurarEventos();
});

function configurarEventos() {
    // Delegação de eventos para a tabela (já que os botões são gerados dinamicamente)
    document.getElementById('tabela-pendentes').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detalhes')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            abrirModalDetalhes(id);
        }
    });

    // Eventos do Modal de Detalhes
    document.getElementById('btn-fechar-detalhes').addEventListener('click', fecharModalDetalhes);
    document.getElementById('btn-aprovar-tcc').addEventListener('click', aprovarTcc);
    document.getElementById('btn-rejeitar-tcc').addEventListener('click', abrirModalRejeicao);

    // Eventos do Modal de Rejeição
    document.getElementById('btn-fechar-rejeicao-x').addEventListener('click', fecharModalRejeicao);
    document.getElementById('btn-cancelar-rejeicao').addEventListener('click', fecharModalRejeicao);
    document.getElementById('btn-confirmar-rejeicao').addEventListener('click', enviarRejeicao);
}

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
    const template = document.getElementById('template-linha-tcc');

    tbody.innerHTML = ''; // Limpa a tabela

    if (tccs.length === 0) {
        msgVazio.classList.remove('hidden');
        return;
    }

    msgVazio.classList.add('hidden');

    tccs.forEach(tcc => {
        // Clona a estrutura do HTML (separação de responsabilidades)
        const clone = template.content.cloneNode(true);

        clone.querySelector('.col-titulo').textContent = tcc.titulo;
        clone.querySelector('.col-orientador').textContent = `Orientador: ${tcc.orientador}`;
        clone.querySelector('.col-discente').textContent = tcc.discente;
        clone.querySelector('.col-municipio').textContent = tcc.municipio;
        clone.querySelector('.col-mesorregiao').textContent = tcc.mesorregiao;

        // Atribui o ID ao botão para ser capturado no evento de clique
        clone.querySelector('.btn-detalhes').setAttribute('data-id', tcc.id);

        tbody.appendChild(clone);
    });
}

function abrirModalDetalhes(id) {
    const tcc = tccsGlobais.find(t => t.id === id);
    if (!tcc) return;

    tccIdEmAvaliacao = tcc.id;

    // Popula os campos do HTML estático
    document.getElementById('det-titulo').textContent = tcc.titulo;
    document.getElementById('det-discente').textContent = tcc.discente;
    document.getElementById('det-orientador').textContent = tcc.orientador;
    document.getElementById('det-banca').textContent = `${tcc.examinador1 || 'Não informado'} / ${tcc.examinador2 || 'Não informado'}`;
    document.getElementById('det-data-email').textContent = `${tcc.data || 'Não informado'} / ${tcc.email || 'Não informado'}`;
    document.getElementById('det-localidade').textContent = `${tcc.municipio} - ${tcc.microrregiao} (${tcc.mesorregiao})`;
    document.getElementById('det-email-contato').textContent = tcc.emailContato || tcc.email || 'Não informado';

    const linkPdf = document.getElementById('det-pdf-link');
    const avisoPdf = document.getElementById('det-pdf-aviso');

    if (tcc.urlPdf) {
        linkPdf.href = tcc.urlPdf;
        linkPdf.classList.remove('hidden');
        avisoPdf.classList.add('hidden');
    } else {
        linkPdf.classList.add('hidden');
        avisoPdf.classList.remove('hidden');
    }

    document.getElementById('modal-detalhes').classList.remove('hidden');
    document.getElementById('modal-detalhes').style.display = 'flex';
}

function fecharModalDetalhes() {
    document.getElementById('modal-detalhes').classList.add('hidden');
    document.getElementById('modal-detalhes').style.display = 'none';
    tccIdEmAvaliacao = null;
}

// Lógica de Aprovação
function aprovarTcc() {
    const confirmacao = confirm("Tem certeza que deseja aprovar e publicar este TCC?");
    if (!confirmacao) return;

    executarRequisicao(tccIdEmAvaliacao, 'APROVAR', '');
}

// Lógica de Rejeição (Abre o novo modal)
function abrirModalRejeicao() {
    document.getElementById('texto-motivo-rejeicao').value = ""; // Limpa o textarea
    document.getElementById('modal-rejeicao').classList.remove('hidden');
    document.getElementById('modal-rejeicao').style.display = 'flex';
}

function fecharModalRejeicao() {
    document.getElementById('modal-rejeicao').classList.add('hidden');
    document.getElementById('modal-rejeicao').style.display = 'none';
}

function enviarRejeicao() {
    const motivoRejeicao = document.getElementById('texto-motivo-rejeicao').value;

    if (motivoRejeicao.trim() === "") {
        alert("É obrigatório informar um motivo para rejeitar o TCC.");
        document.getElementById('texto-motivo-rejeicao').focus();
        return;
    }

    executarRequisicao(tccIdEmAvaliacao, 'REJEITAR', motivoRejeicao);
}

// Requisição Centralizada
async function executarRequisicao(id, acao, motivo) {
    let url = acao === 'REJEITAR'
        ? `/api/tccs/${id}/rejeitar?motivo=${encodeURIComponent(motivo)}`
        : `/api/tccs/${id}/aprovar`;

    const btnConfirmar = document.getElementById('btn-confirmar-rejeicao');
    if (btnConfirmar) btnConfirmar.disabled = true;

    try {
        const response = await fetch(url, { method: 'PUT' });

        if (response.ok) {
            fecharModalRejeicao();
            fecharModalDetalhes();
            carregarPendentes();
            alert(acao === 'APROVAR' ? "TCC aprovado e notificação enviada!" : "TCC rejeitado, e-mail com o motivo enviado e registro removido!");
        } else {
            const erroTxt = await response.text();
            alert(`Erro ao processar a avaliação: ${erroTxt}`);
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão com o servidor ao tentar processar a ação.');
    } finally {
        if (btnConfirmar) btnConfirmar.disabled = false;
    }
}