package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.EscolaDTO;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.repository.EscolaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EscolaService {

    private final EscolaRepository escolaRepository;

    @Transactional(readOnly = true)
    public List<EscolaDTO> listarTodas() {
        return escolaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EscolaDTO buscarPorId(Long id) {
        Escola e = escolaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com id: " + id));
        return toDTO(e);
    }

    @Transactional(readOnly = true)
    public EscolaDTO buscarPorSigla(String sigla) {
        Escola e = escolaRepository.findBySiglaIgnoreCase(sigla)
                .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com sigla: " + sigla));
        return toDTO(e);
    }

    public EscolaDTO toDTO(Escola e) {
        return EscolaDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .sigla(e.getSigla())
                .descricao(e.getDescricao())
                .corTema(e.getCorTema())
                .ativa(e.getAtiva())
                .build();
    }
}
