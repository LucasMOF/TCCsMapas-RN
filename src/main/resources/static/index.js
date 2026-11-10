// Constante global para facilitar manutenções e futuros deploys
const API_BASE_URL = 'http://localhost:8080/api/tccs';

// Inicialização e Eventos do Mapa
let isToggleMicro = false;

function leaveMicro(){
    if(isToggleMicro){
        isToggleMicro = false;
        const elements = document.getElementsByTagName("path");
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.filter = "opacity(1)";
            elements[i].style.transition = "brightness(1)";
        }
        hideName();
    }
}

function initMapEvents() {
    const paths = document.getElementsByTagName("path");
    const legends = document.getElementsByClassName("legend-item");

    for (let i = 0; i < legends.length; i++) {
        legends[i].addEventListener("mouseover", (element) => toggleMicro(element.target.id), false);
        legends[i].addEventListener("mouseout", () => leaveMicro(), false)
    }

    for (let i = 0; i < paths.length; i++) {
        paths[i].addEventListener("click", (element) => {
            element.stopPropagation(); // Impede que o clique vaze para o SVG
            load(element.target.id);
        }, false);
    }

    const toggle = document.getElementsByTagName("svg");
    console.log(toggle);
    if (toggle.length > 0) {
        toggle[0].addEventListener("click", (element) => {
            const elements = document.getElementsByTagName("path");
            console.log("a");
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.filter = "opacity(1)";
                elements[i].style.transition = "brightness(1)";
            }
            hideName(); // Limpa o tooltip ao resetar o mapa
        });
    }
}

// Regras de Negócio e Mecanismos de Busca

async function executarBuscaAvancada() {
    console.log("Iniciando busca avançada...");

    const filtros = {
        titulo: document.getElementById("titulo").value.trim(),
        discente: document.getElementById("discente").value.trim(),
        orientador: document.getElementById("orientador").value.trim(),
        examinador: document.getElementById("examinador").value.trim(),
        municipio: document.getElementById("municipio").value.trim(),
        regiaoIntermediaria: document.getElementById("regiaoIntermediaria").value.trim(),
        regiaoImediata: document.getElementById("regiaoImediata").value.trim()
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
        const response = await fetch(`${API_BASE_URL}/busca-avancada?${params.toString()}`);

        if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

        const result = await response.json();

        if (Array.isArray(result)) {
            const aside = document.getElementById("aside");
            aside.innerHTML = '<button class="btn-fechar-aside" onclick="hideAside()">✖</button><h1 id="city">Resultados da Busca</h1><h1 id="resultNumber"></h1>';
            document.getElementById("resultNumber").textContent = result.length + " encontrados";

            result.forEach((tcc, i) => createObject(tcc, i));
            aside.style.display = "block";

            aside.scrollIntoView({behavior: 'smooth'});
        }
    } catch (error) {
        console.error("Erro na busca:", error);
    }
}

async function load(id) {
    console.log(id)
    const url = `${API_BASE_URL}/busca?municipio=${encodeURIComponent(id)}`;
    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

        const result = await response.json();
        const aside = document.getElementById("aside");

        aside.innerHTML = '<button class="btn-fechar-aside" onclick="hideAside()">✖</button><h1 id="city"></h1><h1 id="resultNumber"></h1>';
        document.getElementById("city").textContent = id;

        if (Array.isArray(result)) {
            document.getElementById("resultNumber").textContent = result.length + " encontrados";
            result.forEach((tcc, index) => createObject(tcc, index));
            aside.style.display = "block";

            aside.scrollIntoView({behavior: 'smooth'});
        } else {
            console.error("Formato de resposta inesperado:", result);
            document.getElementById("resultNumber").textContent = "Erro no formato dos dados";
            aside.style.display = "block";
            aside.scrollIntoView({behavior: 'smooth'});
        }
    } catch (error) {
        console.error("Erro ao buscar por município:", error);
    }
}

// Manipulação do DOM e Elementos de Interface (UI)

function createObject(info, id) {
    const aside = document.getElementById("aside");
    if (!info) return;

    const div = document.createElement("div");
    div.id = id;
    div.className = "item";
    aside.appendChild(div);

    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    headerDiv.addEventListener("click", () => toggleDetails(div), false);

    if (info.titulo) {
        const h3 = document.createElement("h3");
        h3.textContent = info.titulo;
        headerDiv.appendChild(h3);
    }
    div.appendChild(headerDiv);

    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.display = 'none';
    hiddenDiv.className = "hiddenDiv";
    hiddenDiv.id = id + "hidden";

    hiddenDiv.innerHTML = `
        <p><strong>Discente:</strong> ${info.discente || 'N/A'}</p>
        <p><strong>Orientador:</strong> ${info.orientador || 'N/A'}</p>
        <p><strong>Município:</strong> ${info.municipio || 'N/A'}</p>
        <p><strong>Região Intermediária:</strong> ${info.regiaoIntermediaria || 'N/A'}</p>
        <p><strong>Região Imediata:</strong> ${info.regiaoImediata || 'N/A'}</p>
        <p><strong>Examinadores:</strong> ${info.examinador1 || ''} / ${info.examinador2 || ''}</p>
    `;

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

function toggleMicro(id){
    isToggleMicro = true;
    id = "micro-" +id.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, "");
    const elements = document.getElementsByClassName(id)
    const nonElements = document.getElementsByTagName("path")
    for (let i = 0; i < nonElements.length; i++) {
        nonElements[i].style.filter = "opacity(0.5)";
    }
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.filter = "brightness(1.35)    ";
    }
    showMicroName(elements[0]);
}

function showMicroName(param) {
    const element = (typeof param === 'string') ? document.getElementsByClassName(param) : param;
    if (!element) return;
    console.log(param)

    const nomeMicro = param.getAttribute('data-micro') || '';

    const position = element.getBoundingClientRect();
    const popup = document.getElementById("popup");

    popup.style.top = (position.top < 70) ? (position.top + 70 + "px") : (position.top - 70 + "px");
    popup.style.left = (position.left - 10) + "px";

    popup.textContent = nomeMicro;
    popup.style.display = "block";
}

function showName(param) {
    const element = (typeof param === 'string') ? document.getElementById(param) : param;
    if (!element) return;

    const nomeMunicipio = element.id;
    const nomeImediata = element.getAttribute('data-imediata') || '';
    const nomeIntermediaria = element.getAttribute('data-intermediaria') || '';

    let textoCompleto = nomeMunicipio;
    if (nomeImediata && nomeIntermediaria) {
        textoCompleto = `${nomeMunicipio} — ${nomeImediata} (${nomeIntermediaria})`;
    }

    const position = element.getBoundingClientRect();
    const popup = document.getElementById("popup");

    popup.style.top = (position.top < 70) ? (position.top + 70 + "px") : (position.top - 70 + "px");
    popup.style.left = (position.left - 10) + "px";

    popup.textContent = textoCompleto;
    popup.style.display = "block";
}

function hideName() {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
}

// Funções Utilitárias e Alternadores de Escopo (Toggles)

function startDownload(urlPdf, tituloTCC) {
    if (!urlPdf) {
        alert("URL do PDF não encontrada para este TCC.");
        return;
    }
    window.open(urlPdf, '_blank');
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
            el.scrollIntoView({behavior: 'smooth'});
        } else {
            el.style.display = "none";
        }
    }
}

function toggleCadastro() {
    const cadastro = document.getElementById('form-cadastro');
    if (cadastro) {
        cadastro.style.display = (cadastro.style.display === 'none') ? 'block' : 'none';
    }
}

function hideAside() {
    const aside = document.getElementById("aside");
    if (aside) aside.style.display = "none";
}

function clean() {
    ["titulo", "discente", "orientador", "examinador", "municipio", "regiaoIntermediaria", "regiaoImediata"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

// Ciclo de Vida da Aplicação e Listeners Globais

let listaCidadesGlobal = [
    "ACARI", "ASSÚ", "AFONSO BEZERRA", "ÁGUA NOVA", "ALEXANDRIA", "ALMINO AFONSO",
    "ALTO DO RODRIGUES", "ANGICOS", "ANTÔNIO MARTINS", "APODI", "AREIA BRANCA", "ARÊZ",
    "AUGUSTO SEVERO", "BAÍA FORMOSA", "BARAÚNA", "BARCELONA", "BENTO FERNANDES", "BOA SAÚDE",
    "BODÓ", "BOM JESUS", "BREJINHO", "CAIÇARA DO NORTE", "CAIÇARA DO RIO DO VENTO", "CAICÓ",
    "CAMPO GRANDE", "CAMPO REDONDO", "CANGUARETAMA", "CARAÚBAS", "CARNAÚBA DOS DANTAS",
    "CARNAUBAIS", "CEARÁ-MIRIM", "CERRO CORÁ", "CORONEL EZEQUIEL", "CORONEL JOÃO PESSOA",
    "CRUZETA", "CURRAIS NOVOS", "DOUTOR SEVERIANO", "ENCANTO", "EQUADOR", "ESPÍRITO SANTO",
    "EXTREMOZ", "FELIPE GUERRA", "FERNANDO PEDROZA", "FLORÂNIA", "FRANCISCO DANTAS",
    "FRUTUOSO GOMES", "GALINHOS", "GAMELEIRA", "GOIANINHA", "GOVERNADOR DIX-SEPT ROSADO",
    "GROSSOS", "GUAMARÉ", "IELMO MARINHO", "IPANGUAÇU", "IPUEIRA", "ITAJÁ", "ITAÚ",
    "JAÇANÃ", "JANDAÍRA", "JANDUÍS", "JAPI", "JARDIM DE ANGICOS", "JARDIM DE PIRANHAS",
    "JARDIM DO SERIDÓ", "JOÃO CÂMARA", "JOÃO DIAS", "JOSÉ DA PENHA", "JUCURUTU", "JUNDIÁ",
    "LAGOA D'ANTA", "LAGOA DE PEDRAS", "LAGOA DE VELHOS", "LAGOA NOVA", "LAGOA SALGADA",
    "LAJES", "LAJES PINTADAS", "LUCRÉCIA", "LUÍS GOMES", "MACAÍBA", "MACAU", "MAJOR SALES",
    "MARCELINO VIEIRA", "MARTINS", "MAXARANGUAPE", "MESSIAS TARGINO", "MONTANHAS", "MONTE ALEGRE",
    "MONTE DAS GAMELEIRAS", "MOSSORÓ", "NATAL", "NÍSIA FLORESTA", "NOVA CRUZ", "OLHO-D'ÁGUA DOS BORGES",
    "OURO BRANCO", "PARANÁ", "PARAÚ", "PARAZINHO", "PARELHAS", "PARNAMIRIM", "PASSA E FICA",
    "PASSAGEM", "PATI", "PAU DOS FERROS", "PEDRA GRANDE", "PEDRA PRETA", "PEDRO AVELINO",
    "PEDRO VELHO", "PENDÊNCIAS", "PILÕES", "POÇO BRANCO", "PORTALEGRE", "PORTO DO MANGUE",
    "PUREZA", "RAFAEL FERNANDES", "RAFAEL GODEIRO", "RIACHO DA CRUZ", "RIACHO DE SANTANA",
    "RIACHUELO", "RIO DO FOGO", "RODOLFO FERNANDES", "RUY BARBOSA", "SANTA CRUZ", "SANTA MARIA",
    "SANTANA DO MATOS", "SANTANA DO SERIDÓ", "SANTO ANTÔNIO", "SÃO BENTO DO NORTE",
    "SÃO BENTO DO TRAIRI", "SÃO FERNANDO", "SÃO FRANCISCO DO OESTE", "SÃO GONÇALO DO AMARANTE",
    "SÃO JOÃO DO SABUGI", "SÃO JOSÉ DE MIPIBU", "SÃO JOSÉ DO CAMPESTRE", "SÃO JOSÉ DO SERIDÓ",
    "SÃO MIGUEL", "SÃO MIGUEL DO GOSTOSO", "SÃO PAULO DO POTENGI", "SÃO PEDRO", "SÃO RAFAEL",
    "SÃO TOMÉ", "SÃO VICENTE", "SENADOR ELÓI DE SOUZA", "SENADOR GEORGINO AVELINO", "SERRA CAIADA",
    "SERRA DE SÃO BENTO", "SERRA DO MEL", "SERRA NEGRA DO NORTE", "SERRINHA", "SERRINHA DOS PINTOS",
    "SEVERIANO MELO", "SÍTIO NOVO", "TABOLEIRO GRANDE", "TAIPU", "TANGARÁ", "TENENTE ANANIAS",
    "TENENTE LAURENTINO CRUZ", "TIBAU", "TIBAU DO SUL", "TIMBAÚBA DOS BATISTAS", "TOUROS",
    "TRIUNFO POTIGUAR", "UMARIZAL", "UPANEMA", "VÁRZEA", "VENHA-VER", "VERA CRUZ", "VIÇOSA", "VILA FLOR"
];

let listaRegioesImediatasGlobal = [
    "NATAL", "SANTO ANTÔNIO-PASSA E FICA-NOVA CRUZ", "CANGUARETAMA",
    "SANTA CRUZ", "JOÃO CÂMARA", "SÃO PAULO DO POTENGI",
    "CAICÓ", "CURRAIS NOVOS",
    "MOSSORÓ", "PAU DOS FERROS", "AÇU"
];

const mapeamentoRegioesIBGE = {
    "NATAL": [
        "NATAL", "SANTO ANTÔNIO-PASSA E FICA-NOVA CRUZ", "CANGUARETAMA",
        "SANTA CRUZ", "JOÃO CÂMARA", "SÃO PAULO DO POTENGI"
    ],
    "CAICÓ": [
        "CAICÓ", "CURRAIS NOVOS"
    ],
    "MOSSORÓ": [
        "MOSSORÓ", "PAU DOS FERROS", "AÇU"
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    initMapEvents();

    configurarBuscaCheckbox('busca-municipio', 'lista-checkbox-municipios', 'input-municipio-selecionado');
    configurarBuscaCheckbox('busca-regiao-imediata', 'lista-checkbox-regioes-imediatas', 'input-regiao-imediata-selecionado');

    const form = document.getElementById('formCadastroTcc');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = form.querySelector('input[name="titulo"]').value.trim();
            const regiaoIntermediariaEl = form.querySelector('input[name="regiaoIntermediaria"]:checked');
            const regiaoImediata = document.getElementById('input-regiao-imediata-selecionado').value.trim();
            const emailContato = form.querySelector('input[name="emailContato"]').value.trim();

            if (!titulo || titulo.length < 5) {
                alert("O título do TCC é obrigatório e deve ter pelo menos 5 caracteres.");
                return;
            }

            if (!regiaoIntermediariaEl) {
                alert("A Região Intermediária é obrigatória. Selecione uma opção.");
                return;
            }

            if (!regiaoImediata) {
                alert("A Região Imediata é obrigatória. Selecione uma opção na lista.");
                return;
            }

            if (!emailContato) {
                alert("O e-mail para contato/notificações é obrigatório.");
                return;
            }

            const interSelecionada = regiaoIntermediariaEl.value.trim().toUpperCase().normalize('NFD').replace(/\p{Mn}/gu, "");
            const imediataSelecionada = regiaoImediata.toUpperCase();
            const imediatasValidas = mapeamentoRegioesIBGE[interSelecionada];

            if (!imediatasValidas || !imediatasValidas.includes(imediataSelecionada)) {
                alert(`Erro de localização: A região imediata "${imediataSelecionada}" não pertence à região intermediária "${regiaoIntermediariaEl.value}". Por favor, corrija sua seleção.`);
                return;
            }

            const btnSubmit = e.target.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerText = "Enviando...";
            }

            const formData = new FormData(e.target);

            try {
                const response = await fetch(`${API_BASE_URL}/cadastrar`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert("Cadastro realizado com sucesso! Você receberá atualizações sobre o status da curadoria no e-mail informado para notificações. Por favor, lembre-se de verificar também a sua caixa de SPAM ou Lixo Eletrônico.");
                    e.target.reset();
                    document.getElementById('input-municipio-selecionado').value = "";
                    document.getElementById('input-regiao-imediata-selecionado').value = "";
                    document.getElementById('busca-municipio').value = "";
                    document.getElementById('busca-regiao-imediata').value = "";
                    toggleCadastro();
                } else {
                    const erro = await response.text();
                    alert("Erro ao cadastrar: " + erro);
                }
            } catch (err) {
                console.error("Erro:", err);
                alert("Falha na conexão com o servidor.");
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Cadastrar TCC";
                }
            }
        });
    }
});

function configurarBuscaCheckbox(idInputTexto, idContainerLista, idInputHidden) {
    const inputTexto = document.getElementById(idInputTexto);
    const containerLista = document.getElementById(idContainerLista);
    const inputHidden = document.getElementById(idInputHidden);

    if (!inputTexto || !containerLista || !inputHidden) return;

    const ehRegiaoImediata = idInputTexto.includes('regiao-imediata');
    const fonteDados = ehRegiaoImediata ? listaRegioesImediatasGlobal : listaCidadesGlobal;

    inputTexto.addEventListener('input', () => {
        const termo = inputTexto.value.trim().toUpperCase();
        containerLista.innerHTML = '';

        if (termo.length === 0) {
            containerLista.style.display = 'none';
            inputHidden.value = '';
            return;
        }

        const filtrados = fonteDados.filter(item => item.includes(termo));

        if (filtrados.length === 0) {
            containerLista.style.display = 'none';
            return;
        }

        containerLista.style.display = 'block';

        filtrados.forEach(nome => {
            const label = document.createElement('label');
            label.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 6px; color: #e2e8f0; font-size: 0.85rem; cursor: pointer;";

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'opcao-checkbox';
            checkbox.value = nome;

            checkbox.addEventListener('change', (e) => {
                containerLista.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb !== checkbox) cb.checked = false;
                });

                if (e.target.checked) {
                    inputTexto.value = nome;
                    inputHidden.value = nome;
                    containerLista.style.display = 'none';
                } else {
                    inputTexto.value = '';
                    inputHidden.value = '';
                }
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(nome));
            containerLista.appendChild(label);
        });
    });

    document.addEventListener('click', (e) => {
        if (!inputTexto.contains(e.target) && !containerLista.contains(e.target)) {
            containerLista.style.display = 'none';
        }
    });
}

function toggleLegend() {
    const legend = document.getElementById("map-legend");
    const btn = document.getElementById("btn-toggle-legend");

    legend.classList.toggle("minimized");

    if (legend.classList.contains("minimized")) {
        btn.textContent = "＋";
    } else {
        btn.textContent = "━";
    }
}