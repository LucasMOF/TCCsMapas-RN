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

    @Query("SELECT t FROM Tcc t WHERE LOWER(t.regiaoIntermediaria) = LOWER(:regiaoIntermediaria) AND t.status = 'APROVADO'")
    List<Tcc> findByRegiaoIntermediariaIgnoreCase(@Param("regiaoIntermediaria") String regiaoIntermediaria);

    @Query("SELECT t FROM Tcc t WHERE LOWER(t.regiaoImediata) = LOWER(:regiaoImediata) AND t.status = 'APROVADO'")
    List<Tcc> findByRegiaoImediataIgnoreCase(@Param("regiaoImediata") String regiaoImediata);

    @Query("SELECT t.orientador, COUNT(t) FROM Tcc t WHERE t.status = 'APROVADO' GROUP BY t.orientador")
    List<Object[]> countByOrientador();

    // Busca Avançada Dinâmica - Atualizada para colunas regiao_intermediaria e regiao_imediata
    @Query(value = "SELECT * FROM tcc t WHERE t.status = 'APROVADO' AND " +
            "(:titulo IS NULL OR LOWER(CAST(t.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :titulo, '%'))) AND " +
            "(:discente IS NULL OR LOWER(CAST(t.discente AS TEXT)) LIKE LOWER(CONCAT('%', :discente, '%'))) AND " +
            "(:orientador IS NULL OR LOWER(CAST(t.orientador AS TEXT)) LIKE LOWER(CONCAT('%', :orientador, '%'))) AND " +
            "(:municipio IS NULL OR LOWER(CAST(t.municipio AS TEXT)) LIKE LOWER(CONCAT('%', :municipio, '%'))) AND " +
            "(:regiaoIntermediaria IS NULL OR LOWER(CAST(t.regiao_intermediaria AS TEXT)) LIKE LOWER(CONCAT('%', :regiaoIntermediaria, '%'))) AND " +
            "(:regiaoImediata IS NULL OR LOWER(CAST(t.regiao_imediata AS TEXT)) LIKE LOWER(CONCAT('%', :regiaoImediata, '%'))) AND " +
            "(:examinador IS NULL OR (" +
            "   LOWER(CAST(t.examinador1 AS TEXT)) LIKE LOWER(CONCAT('%', :examinador, '%')) OR " +
            "   LOWER(CAST(t.examinador2 AS TEXT)) LIKE LOWER(CONCAT('%', :examinador, '%'))" +
            "))", nativeQuery = true)
    List<Tcc> buscarAvancada(
            @Param("titulo") String titulo,
            @Param("discente") String discente,
            @Param("orientador") String orientador,
            @Param("municipio") String municipio,
            @Param("regiaoIntermediaria") String regiaoIntermediaria,
            @Param("regiaoImediata") String regiaoImediata,
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