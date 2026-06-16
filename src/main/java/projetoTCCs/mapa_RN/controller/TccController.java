package projetoTCCs.mapa_RN.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import projetoTCCs.mapa_RN.model.Tcc;
import projetoTCCs.mapa_RN.model.dto.RequestTccDTO;
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

    // Endpoint para o Mapa: GET /api/tccs/busca?municipio=Angicos
    @GetMapping("/busca")
    public List<Tcc> buscar(@RequestParam String municipio) {
        return service.buscarPorMunicipio(municipio);
    }

    // Endpoint para Estatísticas
    @GetMapping("/estatisticas")
    public Map<String, Object> getEstatisticas() {
        return service.buscarEstatisticas();
    }

    // Cadastro manual (Módulo próprio futuro)
    @PostMapping
    public Tcc cadastrar(@RequestBody @Validated RequestTccDTO dados) {
        return service.cadastrar(dados);
    }
}