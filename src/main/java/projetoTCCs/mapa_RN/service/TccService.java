package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projetoTCCs.mapa_RN.model.Tcc;
import projetoTCCs.mapa_RN.model.dto.RequestTccDTO;
import projetoTCCs.mapa_RN.repository.TccRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TccService {

    @Autowired
    private TccRepository repository;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    public List<Tcc> buscarPorMunicipio(String municipio) {
        return repository.findByMunicipioContainingIgnoreCase(municipio);
    }

    // NOVO: Busca Avançada que chama o nosso repositório com filtro dinâmico
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
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTccs", repository.count());
        stats.put("porProfessor", repository.countByOrientador());
        return stats;
    }

    public Tcc cadastrarComArquivo(RequestTccDTO dto) throws Exception {

        String urlPublicaPdf = null;

        // Verifica se o arquivo veio preenchido antes de tentar fazer o upload
        if (dto.file() != null && !dto.file().isEmpty()) {
            urlPublicaPdf = supabaseStorageService.uploadPdf(dto.file());
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

        novoTcc.setUrlPdf(urlPublicaPdf); // Vai ser a URL se tiver arquivo, ou null se não tiver

        // Salva no banco de dados
        return repository.save(novoTcc);
    }
}
