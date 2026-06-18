package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
}
