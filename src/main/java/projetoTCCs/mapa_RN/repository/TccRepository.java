package projetoTCCs.mapa_RN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projetoTCCs.mapa_RN.model.Tcc;

import java.util.List;

public interface TccRepository extends JpaRepository<Tcc, Long> {

    List<Tcc> findByMunicipioContainingIgnoreCase(String municipio);

    // Novos métodos para buscas diretas por região (ignorando maiúsculas/minúsculas)
    List<Tcc> findByMesorregiaoIgnoreCase(String mesorregiao);

    List<Tcc> findByMicrorregiaoIgnoreCase(String microrregiao);

    @Query("SELECT t.orientador, COUNT(t) FROM Tcc t GROUP BY t.orientador")
    List<Object[]> countByOrientador();

    // Busca Avançada Dinâmica ATUALIZADA com mesorregião e microrregião
    @Query(value = "SELECT * FROM tcc t WHERE " +
            "(:titulo IS NULL OR LOWER(CAST(t.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :titulo, '%'))) AND " +
            "(:discente IS NULL OR LOWER(CAST(t.discente AS TEXT)) LIKE LOWER(CONCAT('%', :discente, '%'))) AND " +
            "(:orientador IS NULL OR LOWER(CAST(t.orientador AS TEXT)) LIKE LOWER(CONCAT('%', :orientador, '%'))) AND " +
            "(:municipio IS NULL OR LOWER(CAST(t.municipio AS TEXT)) LIKE LOWER(CONCAT('%', :municipio, '%'))) AND " +
            "(:mesorregiao IS NULL OR LOWER(CAST(t.mesorregiao AS TEXT)) LIKE LOWER(CONCAT('%', :mesorregiao, '%'))) AND " +
            "(:microrregiao IS NULL OR LOWER(CAST(t.microrregiao AS TEXT)) LIKE LOWER(CONCAT('%', :microrregiao, '%'))) AND " +
            "(:examinador IS NULL OR (" +
            "   LOWER(CAST(t.examinador1 AS TEXT)) LIKE LOWER(CONCAT('%', :examinador, '%')) OR " +
            "   LOWER(CAST(t.examinador2 AS TEXT)) LIKE LOWER(CONCAT('%', :examinador, '%'))" +
            "))", nativeQuery = true)
    List<Tcc> buscarAvancada(
            @Param("titulo") String titulo,
            @Param("discente") String discente,
            @Param("orientador") String orientador,
            @Param("municipio") String municipio,
            @Param("mesorregiao") String mesorregiao,
            @Param("microrregiao") String microrregiao,
            @Param("examinador") String examinador
    );

    boolean existsByTituloAndDiscente(String titulo, String discente);
}