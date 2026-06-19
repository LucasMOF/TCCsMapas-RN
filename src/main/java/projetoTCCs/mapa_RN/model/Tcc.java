package projetoTCCs.mapa_RN.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.time.LocalDate;

@Entity
public class Tcc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dataDefesa;
    private String discente;
    private String email;
    private String titulo;
    private String orientador;
    private String examinador1;
    private String examinador2;
    private String municipio;

    @Column(name = "url_pdf")
    private String urlPdf;

    public Tcc() {
    }
    public Tcc(Long id, String dataDefesa, String discente, String email, String titulo, String orientador, String examinador1, String examinador2, String municipio, String urlPdf) {
        this.id = id;
        this.dataDefesa = dataDefesa;
        this.discente = discente;
        this.email = email;
        this.titulo = titulo;
        this.orientador = orientador;
        this.examinador1 = examinador1;
        this.examinador2 = examinador2;
        this.municipio = municipio;
        this.urlPdf = urlPdf;
    }

    @PrePersist
    @PreUpdate
    public void preProcessarDados() {
        if (this.municipio != null) this.municipio = this.municipio.toUpperCase();
        if (this.discente != null) this.discente = this.discente.toUpperCase();
        if (this.titulo != null) this.titulo = this.titulo.toUpperCase();
        if (this.orientador != null) this.orientador = this.orientador.toUpperCase();

        // Lógica Segura para Data
        if (this.dataDefesa != null && !this.dataDefesa.isEmpty()) {
            // Se a string só tiver 10 caracteres (formato "YYYY-MM-DD"), assumimos que não tem hora
            // Se a string for maior (ex: "2026-06-19T14:30"), ela já tem hora, então não mexemos.
            if (this.dataDefesa.length() == 10) {
                this.dataDefesa = this.dataDefesa + "T00:00:00";
            }
        }

        // Padronização do Município
        if (this.municipio != null) {
            String mun = this.municipio.toUpperCase().trim();
            // Remove qualquer /RN existente para não ficar /RN/RN
            mun = mun.replace("/RN", "");
            // Adiciona o /RN corretamente
            this.municipio = mun + "/RN";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDataDefesa() {
        return dataDefesa;
    }

    public void setDataDefesa(String dataDefesa) {
        this.dataDefesa = dataDefesa;
    }

    public String getDiscente() {
        return discente;
    }

    public void setDiscente(String discente) {
        this.discente = discente;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getOrientador() {
        return orientador;
    }

    public void setOrientador(String orientador) {
        this.orientador = orientador;
    }

    public String getExaminador1() {
        return examinador1;
    }

    public void setExaminador1(String examinador1) {
        this.examinador1 = examinador1;
    }

    public String getExaminador2() {
        return examinador2;
    }

    public void setExaminador2(String examinador2) {
        this.examinador2 = examinador2;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getUrlPdf () {
        return urlPdf;
    }

    public void setUrlPdf(String urlPdf) {
        this.urlPdf = urlPdf;
    }
}
