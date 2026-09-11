package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.ImportacaoResultadoDTO;
import com.gestaomatriculas.service.ImportacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/importacao")
@RequiredArgsConstructor
public class ImportacaoController {

    private final ImportacaoService importacaoService;

    @PostMapping(value = "/planilha", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportacaoResultadoDTO> importar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(importacaoService.importarArquivo(file));
    }

    @GetMapping("/modelo-csv")
    public ResponseEntity<byte[]> downloadModeloCsv() {
        String csvContent = "Nome;CPF;Email;Telefone;CodigoTurma;CanalOrigem\n" +
                "Maria Fernandes;456.789.012-34;maria@exemplo.com;(11) 91234-5678;ROB-2026-T1;FORMS\n" +
                "João Victor;567.890.123-45;joao@exemplo.com;(11) 92345-6789;ROB-2026-T1;SITE\n";

        byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"modelo_importacao_matriculas.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
