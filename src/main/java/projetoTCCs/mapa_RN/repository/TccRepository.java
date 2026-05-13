package projetoTCCs.mapa_RN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import projetoTCCs.mapa_RN.model.Tcc;

import java.util.List;

public interface TccRepository extends JpaRepository<Tcc, Long> {

    List<Tcc> findByMunicipioContainingIgnoreCase(String municipio);

    // Quantos TCCs um professor orientou
    @Query("SELECT t.orientador, COUNT(t) FROM Tcc t GROUP BY t.orientador")
    List<Object[]> countByOrientador();
}



