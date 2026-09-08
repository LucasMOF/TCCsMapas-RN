// Inicialização e Eventos do Mapa

function onload() {
    const paths = document.getElementsByTagName("path");
    for (let i = 0; i < paths.length; i++) {
        paths[i].addEventListener("click", (element) => load(element.target.id), false);
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
        mesorregiao: document.getElementById("mesorregiao").value.trim(),
        microrregiao: document.getElementById("microrregiao").value.trim()
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
    const url = `http://localhost:8080/api/tccs/busca?municipio=${encodeURIComponent(id)}`;
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
        <p><strong>Mesorregião:</strong> ${info.mesorregiao || 'N/A'}</p>
        <p><strong>Microrregião:</strong> ${info.microrregiao || 'N/A'}</p>
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

function showName(param) {
    const element = (typeof param === 'string') ? document.getElementById(param) : param;
    if (!element) return;

    const nomeMunicipio = element.id;
    const nomeMicro = element.getAttribute('data-micro') || '';
    const nomeMeso = element.getAttribute('data-meso') || '';

    let textoCompleto = nomeMunicipio;
    if (nomeMicro && nomeMeso) {
        textoCompleto = `${nomeMunicipio} — ${nomeMicro} (${nomeMeso})`;
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
    ["titulo", "discente", "orientador", "examinador", "municipio", "mesorregiao", "microrregiao"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

// Ciclo de Vida da Aplicação e Listeners Globais

let listaCidadesGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarMunicipiosIBGE();

    // Configuração dos inputs de busca interativos com checkboxes
    configurarBuscaCheckbox('busca-municipio', 'lista-checkbox-municipios', 'input-municipio-selecionado');
    configurarBuscaCheckbox('busca-microrregiao', 'lista-checkbox-microrregioes', 'input-microrregiao-selecionado');

    // Manipulação do Envio do Formulário de Cadastro com Validação Rigorosa
    const form = document.getElementById('formCadastroTcc');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validações obrigatórias no Front-end antes do envio
            const titulo = form.querySelector('input[name="titulo"]').value.trim();
            const mesorregiaoEl = form.querySelector('input[name="mesorregiao"]:checked');
            const microrregiao = document.getElementById('input-microrregiao-selecionado').value.trim();

            if (!titulo || titulo.length < 5) {
                alert("O título do TCC é obrigatório e deve ter pelo menos 5 caracteres.");
                return;
            }

            if (!mesorregiaoEl) {
                alert("A Mesorregião é obrigatória. Selecione uma opção.");
                return;
            }

            if (!microrregiao) {
                alert("A Microrregião é obrigatória. Selecione uma opção na lista.");
                return;
            }

            const btnSubmit = e.target.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerText = "Enviando...";
            }

            const formData = new FormData(e.target);

            try {
                const response = await fetch('http://localhost:8080/api/tccs/cadastrar', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert("Cadastro realizado com sucesso! Seu TCC passará por uma curadoria da nossa equipe e você será notificado via e-mail (caso tenha informado).");
                    e.target.reset();
                    document.getElementById('input-municipio-selecionado').value = "";
                    document.getElementById('input-microrregiao-selecionado').value = "";
                    document.getElementById('busca-municipio').value = "";
                    document.getElementById('busca-microrregiao').value = "";
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

function carregarMunicipiosIBGE() {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/RN/municipios')
        .then(response => response.json())
        .then(cidades => {
            listaCidadesGlobal = cidades.map(c => c.nome.toUpperCase());

            const datalist = document.getElementById('lista-municipios-rn');
            if (datalist) {
                cidades
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .forEach(cidade => {
                        const option = document.createElement('option');
                        option.value = cidade.nome.toUpperCase();
                        datalist.appendChild(option);
                    });
            }
        })
        .catch(erro => console.error("Erro ao carregar municípios do IBGE:", erro));
}

// Função que cria o comportamento dinâmico de digitar e selecionar via checkbox
function configurarBuscaCheckbox(idInputTexto, idContainerLista, idInputHidden) {
    const inputTexto = document.getElementById(idInputTexto);
    const containerLista = document.getElementById(idContainerLista);
    const inputHidden = document.getElementById(idInputHidden);

    if (!inputTexto || !containerLista || !inputHidden) return;

    inputTexto.addEventListener('input', () => {
        const termo = inputTexto.value.trim().toUpperCase();
        containerLista.innerHTML = '';

        if (termo.length === 0) {
            containerLista.style.display = 'none';
            inputHidden.value = '';
            return;
        }

        const filtrados = listaCidadesGlobal.filter(item => item.includes(termo));

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