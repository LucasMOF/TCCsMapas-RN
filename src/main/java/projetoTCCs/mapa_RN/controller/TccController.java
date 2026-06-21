package projetoTCCs.mapa_RN.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import projetoTCCs.mapa_RN.model.Tcc;
import projetoTCCs.mapa_RN.model.dto.RequestTccDTO;
import projetoTCCs.mapa_RN.service.SupabaseStorageService;
import projetoTCCs.mapa_RN.service.TccService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.util.JSONPObject;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/tccs")
@CrossOrigin(origins = "*")
public class TccController {

    @Autowired
    private TccService service;

    // Endpoint para busca avançada
    @GetMapping("/busca-avancada")
    public List<Tcc> buscarAvancada(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String discente,
            @RequestParam(required = false) String orientador,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String examinador) {

        return service.buscarAvancada(titulo, discente, orientador, municipio, examinador);
    }

    // Endpoint para o Mapa
    @GetMapping("/busca")
    public List<Tcc> buscar(@RequestParam String municipio) {
        return service.buscarPorMunicipio(municipio);
    }

    // Endpoint para Estatísticas
    @GetMapping("/estatisticas")
    public Map<String, Object> getEstatisticas() {
        return service.buscarEstatisticas();
    }

    // Endpoint para cadastro de novos TCCs
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarTcc(@ModelAttribute @Valid RequestTccDTO dadosTcc) {
        boolean duplicado = service.tccDuplicado(dadosTcc.titulo(), dadosTcc.discente());

        // Verifica se o TCC já está no banco
        if (duplicado) {
            // Retorna o HTTP Status 409 (Conflict) informando a duplicidade
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este TCC já foi cadastrado para este discente e este Titulo!");
        }
        try {
            // Repassa apenas o DTO para o Service
            Tcc tccSalvo = service.cadastrar(dadosTcc);
            return ResponseEntity.ok(tccSalvo);

        } catch (IllegalArgumentException e) {
            // Retorna 400 Bad Request se o arquivo não for PDF
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            // Retorna 500 apenas para falhas reais do servidor/banco
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao salvar o TCC: " + e.getMessage());
        }
    }
}
