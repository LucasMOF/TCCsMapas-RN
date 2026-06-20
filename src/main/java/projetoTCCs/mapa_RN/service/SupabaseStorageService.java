package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    public String uploadPdf(MultipartFile file, String nomeSeguro) throws IOException {
        // 1. Gera um nome único para o arquivo não sobrescrever outro TCC com nome igual
        String nomeOriginal = file.getOriginalFilename();
        if (nomeOriginal == null) {
            nomeOriginal = "tcc.pdf";
        }
        // Remove espaços e caracteres estranhos do nome do arquivo
        String nomeLimpo = nomeOriginal.replaceAll("[^a-zA-Z0-9.-]", "_");
        String fileName = UUID.randomUUID().toString() + "-" + nomeLimpo;

        // 2. Monta a URL de upload da API do Supabase
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        // 3. Prepara a requisição HTTP
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        headers.add("apikey", supabaseKey);
        headers.setContentType(MediaType.valueOf("application/pdf"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        // 4. Dispara o arquivo para o Supabase
        ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        // 5. Se der sucesso (código 200), retorna o link público do PDF!
        if (response.getStatusCode().is2xxSuccessful()) {
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
        } else {
            throw new RuntimeException("Erro no Supabase. Status: " + response.getStatusCode());
        }
    }
}