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

    public Tcc cadastrar(RequestTccDTO dto) throws Exception {
        validarBanca(dto);

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

        Tcc novoTcc = converterDtoParaEntidade(dto);
        novoTcc.setUrlPdf(urlSupabase);

        return repository.save(novoTcc);
    }

    public List<Tcc> listarTodos() {
        return repository.findAll();
    }

    public boolean tccDuplicado(String titulo, String discente) {
        if (titulo == null || discente == null) return false;

        String tituloFormatado = titulo.trim().toUpperCase();
        String discenteFormatado = discente.trim().toUpperCase();

        return repository.existsByTituloAndDiscente(tituloFormatado, discenteFormatado);
    }

    public Map<String, Object> buscarEstatisticas() {
        List<Tcc> todosTccs = repository.findAll();
        long totalTccs = todosTccs.size();

        Map<String, ProfessorStatsDTO> mapaProfessores = new HashMap<>();

        for (Tcc tcc : todosTccs) {
            if (tcc.getOrientador() != null && !tcc.getOrientador().isBlank()) {
                String nome = limparNome(tcc.getOrientador());
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addOrientacao();
            }

            if (tcc.getExaminador1() != null && !tcc.getExaminador1().isBlank()) {
                String nome = limparNome(tcc.getExaminador1());
                mapaProfessores.putIfAbsent(nome, new ProfessorStatsDTO(nome));
                mapaProfessores.get(nome).addBanca();
            }

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

    // ====================================================================
    //                     MÉTODOS PRIVADOS AUXILIARES
    // ====================================================================

    private Tcc converterDtoParaEntidade(RequestTccDTO dto) {
        Tcc tcc = new Tcc();
        tcc.setDiscente(dto.discente() != null ? dto.discente().toUpperCase().trim() : null);
        tcc.setTitulo(dto.titulo() != null ? dto.titulo().toUpperCase().trim() : null);
        tcc.setOrientador(dto.orientador() != null ? dto.orientador().toUpperCase().trim() : null);
        tcc.setMunicipio(dto.municipio() != null ? dto.municipio().toUpperCase().trim() : null);
        tcc.setExaminador1(dto.examinador1() != null ? dto.examinador1().toUpperCase().trim() : null);
        tcc.setExaminador2(dto.examinador2() != null ? dto.examinador2().toUpperCase().trim() : null);
        tcc.setEmail(dto.email());
        tcc.setDataDefesa(dto.dataDefesa());
        return tcc;
    }

    private void validarBanca(RequestTccDTO dados) {
        validarNomeAcademico(dados.orientador(), "orientador");
        validarNomeAcademico(dados.examinador1(), "examinador 1");
        validarNomeAcademico(dados.examinador2(), "examinador 2");
    }

    private void validarNomeAcademico(String nome, String labelCampo) {
        if (nome == null || nome.isBlank()) return;

        if (nome.matches(".*[ºª].*")) {
            throw new IllegalArgumentException(
                    String.format("O nome do %s não deve conter caracteres de titulação (como 'º' ou 'ª').", labelCampo)
            );
        }
    }

    private String limparNome(String nome) {
        if (nome == null || nome.isBlank()) return "DESCONHECIDO";

        String n = nome.toUpperCase().trim();

        String[] lixo = {
                "PROF. DR.ª", "PROFº. DRº.", "PROF. DRA.", "PROFª. DRª.", "PROF. DR.", "PROF. MSC.", "PROF. ME.", "PROF. ESP.",
                "PROFA. DRA.", "PROFA. MSC.", "PROFA. ME.", "PROFA. ESP.", "PROFA.",
                "PROF. DRª.", "PROF. DR", "PROF. MSC", "PROF. ME", "PROFº.", "PROFA", "PROF.", "PRFA.", "PROF", "POFA.",
                "DR.ª", "DRA.", "DR.", "MSC.", "ME.", "MS.", "ESP.", "ENG.", "ENGª.", "CIVIL", "BEL.", "º"
        };

        for (String termo : lixo) {
            n = n.replace(termo, "");
        }

        n = n.replace("MEMEDEIROS", "MEDEIROS")
                .replace("SÂVALENSCA", "SÂMEA VALENSCA")
                .replace("SÂA VALENSCA", "SÂMEA VALENSCA")
                .replace("ANTÔNIO ALCÊCÂMARA", "ANTÔNIO ALCÊU CÂMARA")
                .replace("FORBELONI", "FORONI");

        return n.replaceAll("\\s+", " ").trim();
    }
}