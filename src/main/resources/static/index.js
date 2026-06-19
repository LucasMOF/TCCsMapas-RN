/**
 * Inicialização
 */
function onload() {
    const paths = document.getElementsByTagName("path");
    for (let i = 0; i < paths.length; i++) {
        paths[i].addEventListener("click", (element) => load(element.target.id), false);
    }
}

/**
 * Função principal de Busca Avançada
 */
async function executarBuscaAvancada() {
    console.log("Iniciando busca avançada...");

    const filtros = {
        titulo: document.getElementById("titulo").value.trim(),
        discente: document.getElementById("discente").value.trim(),
        orientador: document.getElementById("orientador").value.trim(),
        examinador: document.getElementById("examinador").value.trim(),
        municipio: document.getElementById("municipio").value.trim()
    };

    const temFiltro = Object.values(filtros).some(valor => valor !== "");
    const msgErro = document.getElementById("errorMessage");

    if (!temFiltro) {
        msgErro.textContent = "Por favor, preencha pelo menos um campo!";
        msgErro.style.display = "block";
        return;
    }
    msgErro.style.display = "none";

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filtros)) {
        if (value) params.append(key, value);
    }

    try {
        const response = await fetch(`http://localhost:8080/api/tccs/busca-avancada?${params.toString()}`);

        if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

        const result = await response.json();

        if (Array.isArray(result)) {
            const aside = document.getElementById("aside");
            aside.innerHTML = '<button onclick="hideAside()">X</button><h1 id="city">Resultados</h1><h1 id="resultNumber"></h1>';
            document.getElementById("resultNumber").textContent = result.length + " encontrados";

            result.forEach((tcc, i) => createObject(tcc, i));
            aside.style.display = "block";

            // Rola a tela suavemente até a barra lateral
            aside.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Erro na busca:", error);
    }
}

/**
 * Funções de Construção de Objetos e UI
 */
function createObject(info, id) {
    const aside = document.getElementById("aside");
    if (!info) return;

    const div = document.createElement("div");
    div.id = id;
    div.className = "item";
    aside.appendChild(div);

    // Header (Título clicável)
    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    headerDiv.addEventListener("click", () => toggleDetails(div), false);

    if (info.titulo) {
        const h3 = document.createElement("h3");
        h3.textContent = info.titulo;
        headerDiv.appendChild(h3);
    }
    div.appendChild(headerDiv);

    // Conteúdo escondido (Detalhes do TCC)
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.display = 'none';
    hiddenDiv.className = "hiddenDiv";
    hiddenDiv.id = id + "hidden";

    // Adicionando os detalhes do TCC
    hiddenDiv.innerHTML = `
        <p><strong>Discente:</strong> ${info.discente || 'N/A'}</p>
        <p><strong>Orientador:</strong> ${info.orientador || 'N/A'}</p>
        <p><strong>Município:</strong> ${info.municipio || 'N/A'}</p>
        <p><strong>Examinadores:</strong> ${info.examinador1 || ''} / ${info.examinador2 || ''}</p>
    `;

    // Botão de Visualização / Download
    const btn = document.createElement("button");
    btn.className = "downloadBtn";

    if (info.urlPdf) {
        btn.textContent = "Visualizar PDF";
        btn.onclick = () => startDownload(info.urlPdf, info.titulo);
    } else {
        btn.textContent = "PDF Indisponível";
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    }

    hiddenDiv.appendChild(btn);
    div.appendChild(hiddenDiv);
}

/**
 * Funções de Ação e Utilidades
 */
function startDownload(urlPdf, tituloTCC) {
    if (!urlPdf) {
        alert("URL do PDF não encontrada para este TCC.");
        return;
    }
    console.log(`Abrindo PDF do TCC: ${tituloTCC}`);
    window.open(urlPdf, '_blank');
}

async function load(id) {
    const url = `http://localhost:8080/api/tccs/busca?municipio=${encodeURIComponent(id)}`;
    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

        const result = await response.json();
        const aside = document.getElementById("aside");

        aside.innerHTML = '<button onclick="hideAside()">X</button><h1 id="city"></h1><h1 id="resultNumber"></h1>';
        document.getElementById("city").textContent = id;

        if (Array.isArray(result)) {
            document.getElementById("resultNumber").textContent = result.length + " encontrados";
            result.forEach((tcc, index) => createObject(tcc, index));
            aside.style.display = "block";

            // Rola a tela suavemente até a barra lateral
            aside.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error("Formato de resposta inesperado para o município:", result);
            document.getElementById("resultNumber").textContent = "Erro no formato dos dados";
            aside.style.display = "block";

            // Rola a tela mesmo se houver erro para mostrar a mensagem
            aside.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Erro ao buscar por município:", error);
    }
}

function showName(id) {
    const element = document.getElementById(id);
    if (!element) return;
    const position = element.getBoundingClientRect();
    const popup = document.getElementById("popup");
    popup.style.top = (position.top < 70) ? (position.top + 70 + "px") : (position.top - 70 + "px");
    popup.style.left = (position.left - 10) + "px";
    popup.textContent = id;
    popup.style.display = "block";
}

function hideName() {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
}

function toggleDetails(divElement) {
    const hiddenDiv = divElement.querySelector('.hiddenDiv');
    if (hiddenDiv) {
        hiddenDiv.style.display = (hiddenDiv.style.display === "none") ? "block" : "none";
    }
}

function toggleSearch() {
    const el = document.getElementById("search");
    if (el) {
        if (window.getComputedStyle(el).display === "none") {
            el.style.display = "flex";
            el.scrollIntoView({ behavior: 'smooth' });
        } else {
            el.style.display = "none";
        }
    }
}

function hideAside() {
    document.getElementById("aside").style.display = "none";
}

function clean() {
    ["titulo", "discente", "orientador", "examinador", "municipio"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}