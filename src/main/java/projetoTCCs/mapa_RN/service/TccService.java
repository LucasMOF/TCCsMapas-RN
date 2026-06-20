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
        long totalTccs = todosTccs.size();

        Map<String, ProfessorStatsDTO> mapaProfessores = new HashMap<>();

        for (Tcc tcc : todosTccs) {
            // Processa Orientações
            if (tcc.getOrientador() != null && !tcc.getOrientador().isBlank()) {
                String nome = limparNome(tcc.getOrientador());
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addOrientacao();
            }

            // Processa Bancas (Examinador 1)
            if (tcc.getExaminador1() != null && !tcc.getExaminador1().isBlank()) {
                String nome = limparNome(tcc.getExaminador1());
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addBanca();
            }

            // Processa Bancas (Examinador 2)
            if (tcc.getExaminador2() != null && !tcc.getExaminador2().isBlank()) {
                String nome = limparNome(tcc.getExaminador2());
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addBanca();
            }
        }

        List<ProfessorStatsDTO> listaProfessores = new ArrayList<>(mapaProfessores.values());
        listaProfessores.sort((p1, p2) -> Integer.compare(p2.getTotal(), p1.getTotal()));

        Map<String, Object> response = new HashMap<>();
        response.put("totalTccs", totalTccs);
        response.put("professores", listaProfessores);

        return response;
    }

    // Método auxiliar para remover títulos e normalizar nomes
    private String limparNome(String nome) {
        if (nome == null || nome.isBlank()) return "DESCONHECIDO";

        String n = nome.toUpperCase().trim();

        // 1. Dicionário de remoção: adicione aqui qualquer combinação que você vir na lista
        // A ordem importa: tente os títulos mais longos primeiro
        String[] lixo = {
                "PROF. DR.ª", "PROFº. DRº.", "PROF. DRA.", "PROFª. DRª.", "PROF. DR.", "PROF. MSC.", "PROF. ME.", "PROF. ESP.",
                "PROFA. DRA.", "PROFA. MSC.", "PROFA. ME.", "PROFA. ESP.", "PROFA.",
                "PROF. DRª.", "PROF. DR", "PROF. MSC", "PROF. ME", "PROFº.", "PROFA", "PROF.", "PRFA.", "PROF", "POFA.",
                "DR.ª", "DRA.", "DR.", "MSC.", "ME.", "ME", "MS.", "ESP.", "ENG.", "ENGª.", "CIVIL", "BEL.", "º"
        };

        for (String termo : lixo) {
            n = n.replace(termo, "");
        }

        // 2. Correções manuais de nomes cortados ou erros comuns
        n = n.replace("MEMEDEIROS", "MEDEIROS")
                .replace("SÂVALENSCA", "SÂMEA VALENSCA")
                .replace("SÂA VALENSCA", "SÂMEA VALENSCA") // <--- Corrigido aqui
                .replace("ANTÔNIO ALCÊCÂMARA", "ANTÔNIO ALCÊU CÂMARA")
                .replace("FORBELONI", "FORONI");

        // 3. Limpeza final de espaços extras
        return n.replaceAll("\\s+", " ").trim();
    }

    public Tcc cadastrarComArquivo(RequestTccDTO dto) throws Exception {
        String urlSupabase = null;

        if (dto.file() != null && !dto.file().isEmpty()) {
            if (!"application/pdf".equals(dto.file().getContentType())) {
                throw new IllegalArgumentException("Apenas arquivos no formato PDF são permitidos.");
            }

            String nomeOriginal = dto.file().getOriginalFilename();
            String extensao = ".pdf";

            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            String nomeSeguro = UUID.randomUUID().toString() + extensao;
            urlSupabase = supabaseStorageService.uploadPdf(dto.file(), nomeSeguro);
        }

        Tcc novoTcc = new Tcc();
        novoTcc.setTitulo(dto.titulo());
        novoTcc.setDiscente(dto.discente());
        novoTcc.setOrientador(dto.orientador());
        novoTcc.setExaminador1(dto.examinador1());
        novoTcc.setExaminador2(dto.examinador2());
        novoTcc.setMunicipio(dto.municipio());
        novoTcc.setDataDefesa(dto.dataDefesa());
        novoTcc.setEmail(dto.email());
        novoTcc.setUrlPdf(urlSupabase);

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