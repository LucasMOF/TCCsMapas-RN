package projetoTCCs.mapa_RN.model.dto;

public class ProfessorStatsDTO {
    private String nome;
    private int orientacoes = 0;
    private int bancas = 0;

    public ProfessorStatsDTO(String nome) {
        this.nome = nome;
    }

    public void addOrientacao() { this.orientacoes++; }
    public void addBanca() { this.bancas++; }

    // Getters para o Spring conseguir converter para JSON
    public String getNome() { return nome; }
    public int getOrientacoes() { return orientacoes; }
    public int getBancas() { return bancas; }
    public int getTotal() { return orientacoes + bancas; }
}
