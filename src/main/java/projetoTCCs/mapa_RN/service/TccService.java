package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import projetoTCCs.mapa_RN.model.Tcc;
import projetoTCCs.mapa_RN.model.dto.ProfessorStatsDTO;
import projetoTCCs.mapa_RN.model.dto.RequestTccDTO;
import projetoTCCs.mapa_RN.repository.TccRepository;

import java.util.*;

@Service
public class TccService {

    @Autowired
    private TccRepository repository;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    public List<Tcc> buscarPorMunicipio(String municipio) {
        return repository.findByMunicipioContainingIgnoreCase(municipio);
    }

    public List<Tcc> buscarAvancada(String titulo, String discente, String orientador, String municipio, String examinador) {
        return repository.buscarAvancada(titulo, discente, orientador, municipio, examinador);
    }

    public Tcc cadastrar(RequestTccDTO dados) {
        Tcc novoTcc = new Tcc();

        novoTcc.setDiscente(dados.discente().toUpperCase());
        novoTcc.setTitulo(dados.titulo().toUpperCase());
        novoTcc.setOrientador(dados.orientador().toUpperCase());
        novoTcc.setMunicipio(dados.municipio().toUpperCase());
        novoTcc.setExaminador1(dados.examinador1().toUpperCase());
        novoTcc.setExaminador2(dados.examinador2().toUpperCase());

        novoTcc.setEmail(dados.email());
        novoTcc.setDataDefesa(dados.dataDefesa());

        return repository.save(novoTcc);
    }

    public List<Tcc> listarTodos() {
        return repository.findAll();
    }

    public Map<String, Object> buscarEstatisticas() {
        List<Tcc> todosTccs = repository.findAll();
        long totalTccs = todosTccs.size(); // Conta as linhas exatas, ignorando IDs pulados

        Map<String, ProfessorStatsDTO> mapaProfessores = new HashMap<>();

        for (Tcc tcc : todosTccs) {
            // Conta Orientações
            if (tcc.getOrientador() != null && !tcc.getOrientador().isBlank()) {
                String nome = tcc.getOrientador().trim().toUpperCase();
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addOrientacao();
            }

            // Conta Bancas (Examinador 1)
            if (tcc.getExaminador1() != null && !tcc.getExaminador1().isBlank()) {
                String nome = tcc.getExaminador1().trim().toUpperCase();
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addBanca();
            }

            // Conta Bancas (Examinador 2)
            if (tcc.getExaminador2() != null && !tcc.getExaminador2().isBlank()) {
                String nome = tcc.getExaminador2().trim().toUpperCase();
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addBanca();
            }
        }

        // Converte o mapa para uma lista e ordena do professor com mais participações para o menor
        List<ProfessorStatsDTO> listaProfessores = new ArrayList<>(mapaProfessores.values());
        listaProfessores.sort((p1, p2) -> Integer.compare(p2.getTotal(), p1.getTotal()));

        // Monta a resposta final
        Map<String, Object> response = new HashMap<>();
        response.put("totalTccs", totalTccs);
        response.put("professores", listaProfessores);

        return response;
    }

    public Tcc cadastrarComArquivo(RequestTccDTO dto) throws Exception {
        String urlSupabase = null;

        // Verifica se o arquivo veio preenchido antes de tentar fazer o upload
        if (dto.file() != null && !dto.file().isEmpty()) {

            if (!"application/pdf".equals(dto.file().getContentType())) {
                throw new IllegalArgumentException("Apenas arquivos no formato PDF são permitidos.");
            }

            String nomeOriginal = dto.file().getOriginalFilename();
            String extensao = ".pdf"; // Extensão padrão caso falhe a extração

            // Extrai a extensão original de forma segura (.pdf, .PDF, etc.)
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            // Gera um nome único via UUID livre de acentos, espaços ou caracteres especiais
            String nomeSeguro = UUID.randomUUID().toString() + extensao;

            // Enviamos o arquivo E o novo nome seguro para o Supabase
            urlSupabase = supabaseStorageService.uploadPdf(dto.file(), nomeSeguro);
        }

        // Cria o objeto TCC e popula com os dados
        Tcc novoTcc = new Tcc();
        novoTcc.setTitulo(dto.titulo());
        novoTcc.setDiscente(dto.discente());
        novoTcc.setOrientador(dto.orientador());
        novoTcc.setExaminador1(dto.examinador1());
        novoTcc.setExaminador2(dto.examinador2());
        novoTcc.setMunicipio(dto.municipio());
        novoTcc.setDataDefesa(dto.dataDefesa());
        novoTcc.setEmail(dto.email());

        novoTcc.setUrlPdf(urlSupabase); // Vai ser a URL se tiver arquivo, ou null se não tiver

        // Salva no banco de dados
        return repository.save(novoTcc);
    }

    public boolean tccDuplicado(String titulo, String discente) {
        if (titulo == null || discente == null) {
            return false;
        }
        String tituloFormatado = titulo.trim().toUpperCase();
        String discenteFormatado = discente.trim().toUpperCase();

        return repository.existsByTituloAndDiscente(tituloFormatado, discenteFormatado);
    }
}


