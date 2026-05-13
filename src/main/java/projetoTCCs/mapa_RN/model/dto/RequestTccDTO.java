package projetoTCCs.mapa_RN.model.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RequestTccDTO(

        @NotBlank(message = "A data de defesa é obrigatória")
        String dataDefesa,

        @NotBlank(message = "O nome do discente é obrigatório")        String discente,

        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "O título é obrigatório")
        @Size(min = 5, message = "O título deve ter pelo menos 5 caracteres")
        String titulo,

        @NotBlank(message = "O orientador é obrigatório")
        String orientador,
        String examinador1,
        String examinador2,

        @NotBlank(message = "O município é obrigatório")
        String municipio


        ) {
}
