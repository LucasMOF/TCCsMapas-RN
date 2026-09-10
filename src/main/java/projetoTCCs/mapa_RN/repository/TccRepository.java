package projetoTCCs.mapa_RN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projetoTCCs.mapa_RN.model.Tcc;

import java.util.List;
import java.util.Map;

public interface TccRepository extends JpaRepository<Tcc, Long> {

    // Só retorna se o status for APROVADO.
    @Query("SELECT t FROM Tcc t WHERE LOWER(t.municipio) LIKE LOWER(CONCAT('%', :municipio, '%')) AND t.status = 'APROVADO'")
    List<Tcc> findByMunicipioContainingIgnoreCase(@Param("municipio") String municipio);

    @Query("SELECT t FROM Tcc t WHERE LOWER(t.mesorregiao) = LOWER(:mesorregiao) AND t.status = 'APROVADO'")
    List<Tcc> findByMesorregiaoIgnoreCase(@Param("mesorregiao") String mesorregiao);

    @Query("SELECT t FROM Tcc t WHERE LOWER(t.microrregiao) = LOWER(:microrregiao) AND t.status = 'APROVADO'")
    List<Tcc> findByMicrorregiaoIgnoreCase(@Param("microrregiao") String microrregiao);

    @Query("SELECT t.orientador, COUNT(t) FROM Tcc t WHERE t.status = 'APROVADO' GROUP BY t.orientador")
    List<Object[]> countByOrientador();

    // Busca Avançada Dinâmica - Status travado como APROVADO logo no início do WHERE
    @Query(value = "SELECT * FROM tcc t WHERE t.status = 'APROVADO' AND " +
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

    // Impedimos que um usuário cadastre um TCC igual a um que ainda está "PENDENTE" de aprovação.
    boolean existsByTituloAndDiscente(String titulo, String discente);

    @Query("SELECT t.municipio AS municipio, COUNT(t) AS total FROM Tcc t WHERE t.status = 'APROVADO' GROUP BY t.municipio")
    List<Map<String, Object>> contarTccsPorMunicipio();

    // Método para o painel adm, para listar o que precisa ser curado
    @Query("SELECT t FROM Tcc t WHERE t.status = 'PENDENTE' ORDER BY t.id ASC")
    List<Tcc> buscarPendentes();
}