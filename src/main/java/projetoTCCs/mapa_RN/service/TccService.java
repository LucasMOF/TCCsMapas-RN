package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import projetoTCCs.mapa_RN.model.Tcc;
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

    public Tcc cadastrar(Tcc tcc) {
        return repository.save(tcc);
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
