package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.ChamadaDetalheDTO;
import com.gestaomatriculas.dto.ChamadaItemDTO;
import com.gestaomatriculas.dto.ChamadaResumoDTO;
import com.gestaomatriculas.dto.SalvarChamadaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Matricula;
import com.gestaomatriculas.model.RegistroPresenca;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.TurmaMateria;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.TurmaMateriaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChamadaService {

    private final RegistroPresencaRepository registroPresencaRepository;
    private final TurmaRepository turmaRepository;
    private final TurmaMateriaRepository turmaMateriaRepository;
    private final MatriculaRepository matriculaRepository;

    @Transactional(readOnly = true)
    public List<ChamadaItemDTO> obterAlunosParaChamada(Long turmaId, Long materiaId, LocalDate dataAula) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com ID: " + turmaId));

        TurmaMateria materia = turmaMateriaRepository.findById(materiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada com ID: " + materiaId));

        if (!materia.getTurma().getId().equals(turma.getId())) {
            throw new BusinessException("A matéria selecionada não pertence a esta turma.");
        }

        List<Matricula> matriculas = matriculaRepository.findByTurmaId(turmaId).stream()
                .filter(m -> m.getStatus() != StatusMatricula.CANCELADA
                        && m.getStatus() != StatusMatricula.FILA_ESPERA
                        && m.getStatus() != StatusMatricula.DESISTENTE_FALTAS)
                .sorted(Comparator.comparing(m -> m.getAluno().getNome(), String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        // Se informou a data, verifica se já há registros cadastrados para pré-carregar
        Map<Long, RegistroPresenca> mapaPresencasExistentes = new HashMap<>();
        if (dataAula != null) {
            List<RegistroPresenca> existentes = registroPresencaRepository.findByMateriaIdAndDataAula(materiaId, dataAula);
            for (RegistroPresenca r : existentes) {
                mapaPresencasExistentes.put(r.getMatricula().getId(), r);
            }
        }

        return matriculas.stream().map(m -> {
            RegistroPresenca reg = mapaPresencasExistentes.get(m.getId());
            return ChamadaItemDTO.builder()
                    .alunoId(m.getAluno().getId())
                    .alunoNome(m.getAluno().getNome())
                    .alunoCpf(m.getAluno().getCpf())
                    .matriculaId(m.getId())
                    .status(reg != null ? reg.getStatus() : StatusPresenca.PRESENTE)
                    .justificativa(reg != null ? reg.getJustificativa() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChamadaResumoDTO> listarChamadas(Long turmaId, Long materiaId) {
        TurmaMateria materia = turmaMateriaRepository.findById(materiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada com ID: " + materiaId));

        List<RegistroPresenca> registros = registroPresencaRepository.findByMateriaIdOrderByDataAulaDesc(materiaId);

        // Agrupar por data da aula
        Map<LocalDate, List<RegistroPresenca>> agrupado = registros.stream()
                .collect(Collectors.groupingBy(RegistroPresenca::getDataAula, LinkedHashMap::new, Collectors.toList()));

        List<ChamadaResumoDTO> resumos = new ArrayList<>();
        for (Map.Entry<LocalDate, List<RegistroPresenca>> entry : agrupado.entrySet()) {
            LocalDate data = entry.getKey();
            List<RegistroPresenca> lista = entry.getValue();

            int total = lista.size();
            int presentes = (int) lista.stream().filter(r -> r.getStatus() == StatusPresenca.PRESENTE).count();
            int faltas = (int) lista.stream().filter(r -> r.getStatus() == StatusPresenca.FALTA).count();
            int justificadas = (int) lista.stream().filter(r -> r.getStatus() == StatusPresenca.JUSTIFICADA).count();
            double pct = total > 0 ? ((double) presentes / total) * 100.0 : 0.0;

            String responsavel = lista.stream()
                    .map(RegistroPresenca::getResponsavelRegistro)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse("Não informado");

            String conteudo = lista.stream()
                    .map(RegistroPresenca::getConteudoMinistrado)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);

            resumos.add(ChamadaResumoDTO.builder()
                    .turmaId(materia.getTurma().getId())
                    .turmaCodigo(materia.getTurma().getCodigo())
                    .materiaId(materia.getId())
                    .materiaNome(materia.getNome())
                    .dataAula(data)
                    .responsavelRegistro(responsavel)
                    .conteudoMinistrado(conteudo)
                    .totalAlunos(total)
                    .totalPresentes(presentes)
                    .totalFaltas(faltas)
                    .totalJustificadas(justificadas)
                    .percentualPresenca(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        return resumos;
    }

    @Transactional(readOnly = true)
    public ChamadaDetalheDTO obterDetalheChamada(Long materiaId, LocalDate dataAula) {
        TurmaMateria materia = turmaMateriaRepository.findById(materiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada com ID: " + materiaId));

        List<RegistroPresenca> registros = registroPresencaRepository.findByMateriaIdAndDataAula(materiaId, dataAula);
        if (registros.isEmpty()) {
            throw new ResourceNotFoundException("Nenhuma chamada encontrada para a data: " + dataAula);
        }

        registros.sort(Comparator.comparing(r -> r.getMatricula().getAluno().getNome(), String.CASE_INSENSITIVE_ORDER));

        int total = registros.size();
        int presentes = (int) registros.stream().filter(r -> r.getStatus() == StatusPresenca.PRESENTE).count();
        int faltas = (int) registros.stream().filter(r -> r.getStatus() == StatusPresenca.FALTA).count();
        int justificadas = (int) registros.stream().filter(r -> r.getStatus() == StatusPresenca.JUSTIFICADA).count();
        double pct = total > 0 ? ((double) presentes / total) * 100.0 : 0.0;

        String responsavel = registros.stream()
                .map(RegistroPresenca::getResponsavelRegistro)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("Não informado");

        String conteudo = registros.stream()
                .map(RegistroPresenca::getConteudoMinistrado)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        List<ChamadaItemDTO> itens = registros.stream().map(r -> ChamadaItemDTO.builder()
                .alunoId(r.getMatricula().getAluno().getId())
                .alunoNome(r.getMatricula().getAluno().getNome())
                .alunoCpf(r.getMatricula().getAluno().getCpf())
                .matriculaId(r.getMatricula().getId())
                .status(r.getStatus())
                .justificativa(r.getJustificativa())
                .build()).collect(Collectors.toList());

        return ChamadaDetalheDTO.builder()
                .turmaId(materia.getTurma().getId())
                .turmaCodigo(materia.getTurma().getCodigo())
                .cursoNome(materia.getTurma().getCurso() != null ? materia.getTurma().getCurso().getNome() : "")
                .materiaId(materia.getId())
                .materiaNome(materia.getNome())
                .dataAula(dataAula)
                .responsavelRegistro(responsavel)
                .conteudoMinistrado(conteudo)
                .totalAlunos(total)
                .totalPresentes(presentes)
                .totalFaltas(faltas)
                .totalJustificadas(justificadas)
                .percentualPresenca(Math.round(pct * 10.0) / 10.0)
                .itens(itens)
                .build();
    }

    @Transactional
    public ChamadaDetalheDTO salvarChamada(SalvarChamadaDTO dto) {
        Turma turma = turmaRepository.findById(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com ID: " + dto.getTurmaId()));

        TurmaMateria materia = turmaMateriaRepository.findById(dto.getMateriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada com ID: " + dto.getMateriaId()));

        if (!materia.getTurma().getId().equals(turma.getId())) {
            throw new BusinessException("A matéria não pertence à turma indicada.");
        }

        if (dto.getResponsavelRegistro() == null || dto.getResponsavelRegistro().trim().isEmpty()) {
            throw new BusinessException("O nome do responsável pelo registro da chamada é obrigatório.");
        }

        String responsavelFormatado = dto.getResponsavelRegistro().trim();

        for (ChamadaItemDTO item : dto.getItens()) {
            Matricula matricula = matriculaRepository.findById(item.getMatriculaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com ID: " + item.getMatriculaId()));

            Optional<RegistroPresenca> existenteOpt = registroPresencaRepository
                    .findByMatriculaIdAndMateriaIdAndDataAula(matricula.getId(), materia.getId(), dto.getDataAula());

            RegistroPresenca registro;
            if (existenteOpt.isPresent()) {
                registro = existenteOpt.get();
                registro.setStatus(item.getStatus());
                registro.setJustificativa(item.getJustificativa());
                registro.setConteudoMinistrado(dto.getConteudoMinistrado());
                registro.setResponsavelRegistro(responsavelFormatado);
            } else {
                registro = RegistroPresenca.builder()
                        .matricula(matricula)
                        .materia(materia)
                        .dataAula(dto.getDataAula())
                        .status(item.getStatus())
                        .justificativa(item.getJustificativa())
                        .conteudoMinistrado(dto.getConteudoMinistrado())
                        .responsavelRegistro(responsavelFormatado)
                        .build();
            }

            registroPresencaRepository.save(registro);
        }

        return obterDetalheChamada(dto.getMateriaId(), dto.getDataAula());
    }
}
