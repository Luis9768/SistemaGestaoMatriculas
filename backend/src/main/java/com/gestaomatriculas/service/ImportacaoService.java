package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.ImportacaoResultadoDTO;
import com.gestaomatriculas.dto.InscricaoExternaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportacaoService {

    private final MatriculaService matriculaService;
    private final TurmaRepository turmaRepository;

    public ImportacaoResultadoDTO importarArquivo(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BusinessException("Arquivo inválido.");
        }

        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return processarExcel(file);
        } else if (filename.endsWith(".csv")) {
            return processarCsv(file);
        } else {
            throw new BusinessException("Formato não suportado. Utilize arquivos .xlsx, .xls ou .csv");
        }
    }

    private ImportacaoResultadoDTO processarExcel(MultipartFile file) {
        ImportacaoResultadoDTO resultado = new ImportacaoResultadoDTO();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int rowCount = sheet.getPhysicalNumberOfRows();

            if (rowCount <= 1) {
                resultado.getLogs().add("A planilha está vazia ou contém apenas cabeçalhos.");
                return resultado;
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                resultado.setTotalLinhas(resultado.getTotalLinhas() + 1);

                String nome = getCellValue(row.getCell(0));
                String cpf = getCellValue(row.getCell(1));
                String email = getCellValue(row.getCell(2));
                String telefone = getCellValue(row.getCell(3));
                String codigoTurma = getCellValue(row.getCell(4));
                String canalStr = getCellValue(row.getCell(5));

                if (nome.isBlank() || cpf.isBlank() || codigoTurma.isBlank()) {
                    resultado.setFalhas(resultado.getFalhas() + 1);
                    resultado.getLogs().add("Linha " + (i + 1) + ": Dados incompletos (Nome, CPF ou Código da Turma em branco).");
                    continue;
                }

                processarInscricao(resultado, i + 1, nome, cpf, email, telefone, codigoTurma, canalStr);
            }

        } catch (Exception e) {
            log.error("Erro ao processar planilha Excel", e);
            throw new BusinessException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        return resultado;
    }

    private ImportacaoResultadoDTO processarCsv(MultipartFile file) {
        ImportacaoResultadoDTO resultado = new ImportacaoResultadoDTO();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (lineNumber == 1) continue; // Pular cabeçalho
                if (line.trim().isEmpty()) continue;

                resultado.setTotalLinhas(resultado.getTotalLinhas() + 1);

                // Suporte para delimitador ; ou ,
                String delimiter = line.contains(";") ? ";" : ",";
                String[] cols = line.split(delimiter, -1);

                if (cols.length < 3) {
                    resultado.setFalhas(resultado.getFalhas() + 1);
                    resultado.getLogs().add("Linha " + lineNumber + ": Linha CSV com colunas insuficientes.");
                    continue;
                }

                String nome = cols.length > 0 ? cols[0].trim() : "";
                String cpf = cols.length > 1 ? cols[1].trim() : "";
                String email = cols.length > 2 ? cols[2].trim() : "";
                String telefone = cols.length > 3 ? cols[3].trim() : "";
                String codigoTurma = cols.length > 4 ? cols[4].trim() : "";
                String canalStr = cols.length > 5 ? cols[5].trim() : "PLANILHA";

                processarInscricao(resultado, lineNumber, nome, cpf, email, telefone, codigoTurma, canalStr);
            }

        } catch (Exception e) {
            log.error("Erro ao processar CSV", e);
            throw new BusinessException("Falha ao ler o arquivo CSV: " + e.getMessage());
        }

        return resultado;
    }

    private void processarInscricao(ImportacaoResultadoDTO resultado, int linha, String nome, String cpf,
                                    String email, String telefone, String codigoTurma, String canalStr) {
        Optional<Turma> optTurma = turmaRepository.findByCodigo(codigoTurma);
        if (optTurma.isEmpty()) {
            resultado.setFalhas(resultado.getFalhas() + 1);
            resultado.getLogs().add("Linha " + linha + ": Turma com código '" + codigoTurma + "' não encontrada.");
            return;
        }

        Turma turma = optTurma.get();
        CanalOrigem canal = CanalOrigem.PLANILHA;
        if (canalStr != null && !canalStr.isBlank()) {
            try {
                canal = CanalOrigem.valueOf(canalStr.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        InscricaoExternaDTO inscricao = InscricaoExternaDTO.builder()
                .nome(nome)
                .cpf(cpf)
                .email(email.isBlank() ? (cpf.replaceAll("\\D", "") + "@sememail.com") : email)
                .telefone(telefone)
                .turmaId(turma.getId())
                .canalOrigem(canal)
                .observacoes("Importação automática - Linha " + linha)
                .build();

        try {
            matriculaService.inscrever(inscricao);
            resultado.setSucesso(resultado.getSucesso() + 1);
            resultado.getLogs().add("Linha " + linha + ": Matrícula realizada com sucesso para " + nome + " na turma " + codigoTurma);
        } catch (BusinessException ex) {
            if (ex.getMessage().contains("já está matriculado")) {
                resultado.setIgnoradas(resultado.getIgnoradas() + 1);
                resultado.getLogs().add("Linha " + linha + " (Ignorada): " + ex.getMessage());
            } else {
                resultado.setFalhas(resultado.getFalhas() + 1);
                resultado.getLogs().add("Linha " + linha + " (Falha): " + ex.getMessage());
            }
        } catch (Exception ex) {
            resultado.setFalhas(resultado.getFalhas() + 1);
            resultado.getLogs().add("Linha " + linha + " (Erro): " + ex.getMessage());
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }
}
