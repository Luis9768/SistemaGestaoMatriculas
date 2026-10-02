package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.AlunoDTO;
import com.gestaomatriculas.dto.AtualizarContatoDTO;
import com.gestaomatriculas.service.AlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;

    /**
     * Consulta paginada com suporte para pesquisa global de todas as 4 escolas ou filtrada por escola,
     * permitindo buscar por nome, email ou CPF.
     */
    @GetMapping
    public ResponseEntity<Page<AlunoDTO>> listar(
            @RequestParam(required = false) Long escolaId,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String cpf,
            @PageableDefault(size = 15, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(alunoService.listarPaginado(escolaId, busca, nome, email, cpf, pageable));
    }

    @GetMapping("/todos")
    public ResponseEntity<List<AlunoDTO>> listarTodos() {
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(alunoService.buscarPorId(id));
    }

    /**
     * Retorna o perfil detalhado do aluno: dados pessoais, cursos atuais, histórico
     * de formação e listagem de presenças com percentual de assiduidade.
     */
    @GetMapping("/{id}/perfil")
    public ResponseEntity<com.gestaomatriculas.dto.PerfilAlunoDTO> obterPerfil(@PathVariable Long id) {
        return ResponseEntity.ok(alunoService.obterPerfilAluno(id));
    }

    /**
     * Registra presença, falta ou justificativa em uma matrícula/aula.
     */
    @PostMapping("/matriculas/{matriculaId}/presencas")
    public ResponseEntity<com.gestaomatriculas.dto.RegistroPresencaDTO> registrarPresenca(
            @PathVariable Long matriculaId,
            @Valid @RequestBody com.gestaomatriculas.dto.RegistroPresencaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoService.registrarPresenca(matriculaId, dto));
    }

    @PostMapping
    public ResponseEntity<AlunoDTO> criar(@Valid @RequestBody AlunoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoDTO> atualizar(
            @PathVariable Long id,
            @RequestBody AlunoDTO dto) {
        return ResponseEntity.ok(alunoService.atualizar(id, dto));
    }

    @PutMapping("/{id}/contato")
    public ResponseEntity<AlunoDTO> atualizarContato(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarContatoDTO dto) {
        return ResponseEntity.ok(alunoService.atualizarContato(id, dto));
    }
}
