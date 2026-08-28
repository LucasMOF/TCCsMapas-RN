document.addEventListener('DOMContentLoaded', gerarRelatorio);

// Array fixo com todos os 167 municípios do RN
const todosMunicipiosRN = [
    "Acari", "Assú", "Afonso Bezerra", "Água Nova", "Alexandria", "Almino Afonso", "Alto do Rodrigues", "Angicos", "Antônio Martins", "Apodi", "Areia Branca", "Arês", "Augusto Severo", "Baía Formosa", "Baraúna", "Barcelona", "Bento Fernandes", "Bodó", "Bom Jesus", "Brejinho", "Caiçara do Norte", "Caiçara do Rio do Vento", "Caicó", "Campo Redondo", "Canguaretama", "Caraúbas", "Carnaúba dos Dantas", "Carnaubais", "Ceará-Mirim", "Cerro Corá", "Coronel Ezequiel", "Coronel João Pessoa", "Cruzeta", "Currais Novos", "Doutor Severiano", "Encanto", "Equador", "Espírito Santo", "Extremoz", "Felipe Guerra", "Fernando Pedroza", "Florânia", "Francisco Dantas", "Frutuoso Gomes", "Galinhos", "Goianinha", "Governador Dix-Sept Rosado", "Grossos", "Guamaré", "Ielmo Marinho", "Ipanguaçu", "Ipueira", "Itajá", "Itaú", "Jaçanã", "Jandaíra", "Janduís", "Januário Cicco", "Japi", "Jardim de Angicos", "Jardim de Piranhas", "Jardim do Seridó", "João Câmara", "João Dias", "José da Penha", "Jucurutu", "Jundiá", "Lagoa d'Anta", "Lagoa de Pedras", "Lagoa de Velhos", "Lagoa Nova", "Lagoa Salgada", "Lajes", "Lajes Pintadas", "Lucrécia", "Luís Gomes", "Macaíba", "Macau", "Major Sales", "Marcelino Vieira", "Martins", "Maxaranguape", "Messias Targino", "Montanhas", "Monte Alegre", "Monte das Gameleiras", "Mossoró", "Natal", "Nísia Floresta", "Nova Cruz", "Olho-d'Água do Borges", "Ouro Branco", "Paraná", "Paraú", "Parazinho", "Parelhas", "Parnamirim", "Passa e Fica", "Passagem", "Patu", "Pau dos Ferros", "Pedra Grande", "Pedra Preta", "Pedro Avelino", "Pedro Velho", "Pendências", "Pilões", "Poço Branco", "Portalegre", "Porto do Mangue", "Presidente Juscelino", "Pureza", "Rafael Fernandes", "Rafael Godeiro", "Riacho da Cruz", "Riacho de Santana", "Riachuelo", "Rio do Fogo", "Rodolfo Fernandes", "Ruy Barbosa", "Santa Cruz", "Santa Maria", "Santana do Matos", "Santana do Seridó", "Santo Antônio", "São Bento do Norte", "São Bento do Trairí", "São Fernando", "São Francisco do Oeste", "São Gonçalo do Amarante", "São João do Sabugi", "São José de Mipibu", "São José do Campestre", "São José do Seridó", "São Miguel", "São Miguel do Gostoso", "São Paulo do Potengi", "São Pedro", "São Rafael", "São Tomé", "São Vicente", "Senador Elói de Souza", "Senador Georgino Avelino", "Serra de São Bento", "Serra do Mel", "Serra Negra do Norte", "Serrinha", "Serrinha dos Pintos", "Severiano Melo", "Sítio Novo", "Taboleiro Grande", "Taipu", "Tangará", "Tenente Ananias", "Tenente Laurentino Cruz", "Tibau", "Tibau do Sul", "Timbaúba dos Batistas", "Touros", "Triunfo Potiguar", "Umarizal", "Upanema", "Várzea", "Venha-Ver", "Vera Cruz", "Viçosa"
];

// Função que remove acentos, espaços extras e converte para minúsculo
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function gerarRelatorio() {
    const conteudo = document.getElementById('conteudo-relatorio');

    try {
        const response = await fetch('http://localhost:8080/api/tccs/relatorio-municipios');
        const dadosBanco = await response.json();

        let dicionarioOficial = {};
        let contagemMunicipios = {};

        // Mapeia o nome normalizado para o nome com a formatação oficial
        todosMunicipiosRN.forEach(mun => {
            const munNormalizado = normalizarTexto(mun);
            dicionarioOficial[munNormalizado] = mun;
            contagemMunicipios[mun] = 0;
        });

        // Compara os dados do banco usando sempre o formato normalizado
        dadosBanco.forEach(item => {
            const munBancoNormalizado = normalizarTexto(item.municipio);

            if (dicionarioOficial[munBancoNormalizado]) {
                const nomeOficial = dicionarioOficial[munBancoNormalizado];
                contagemMunicipios[nomeOficial] += item.total;
            } else if (item.municipio && item.municipio.trim() !== "") {
                // Caso seja um município escrito com erro grosseiro ou de outro estado
                contagemMunicipios[item.municipio.trim()] = item.total;
            }
        });

        let arrayRelatorio = Object.keys(contagemMunicipios).map(nome => {
            return { nome: nome, total: contagemMunicipios[nome] };
        });

        arrayRelatorio.sort((a, b) => {
            if (a.total === b.total) return a.nome.localeCompare(b.nome);
            return a.total - b.total;
        });

        let htmlLista = '<ul class="relatorio-lista">';
        arrayRelatorio.forEach(item => {
            const classeZero = item.total === 0 ? 'zero-tccs' : '';
            const classeBadge = item.total === 0 ? 'badge-tcc zero' : 'badge-tcc';

            htmlLista += `
                <li class="relatorio-item ${classeZero}">
                    <span>${item.nome}</span>
                    <span class="${classeBadge}">${item.total}</span>
                </li>
            `;
        });

        htmlLista += '</ul>';
        conteudo.innerHTML = htmlLista;

    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        conteudo.innerHTML = '<p style="color:#ef4444; text-align:center; padding: 20px;">Erro ao conectar com o servidor.</p>';
    }
}