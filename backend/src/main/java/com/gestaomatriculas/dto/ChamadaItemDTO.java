package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.StatusPresenca;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChamadaItemDTO {
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    
    @NotNull(message = "ID da matrícula é obrigatório")
    private Long matriculaId;
    
    @NotNull(message = "Status da presença é obrigatório")
    private StatusPresenca status;
    
    private String justificativa;

    public static ChamadaItemDTOBuilder builder() {
        return new ChamadaItemDTOBuilder();
    }

    public static class ChamadaItemDTOBuilder {
        private Long alunoId;
        private String alunoNome;
        private String alunoCpf;
        private Long matriculaId;
        private StatusPresenca status;
        private String justificativa;

        public ChamadaItemDTOBuilder alunoId(Long alunoId) {
            this.alunoId = alunoId;
            return this;
        }

        public ChamadaItemDTOBuilder alunoNome(String alunoNome) {
            this.alunoNome = alunoNome;
            return this;
        }

        public ChamadaItemDTOBuilder alunoCpf(String alunoCpf) {
            this.alunoCpf = alunoCpf;
            return this;
        }

        public ChamadaItemDTOBuilder matriculaId(Long matriculaId) {
            this.matriculaId = matriculaId;
            return this;
        }

        public ChamadaItemDTOBuilder status(StatusPresenca status) {
            this.status = status;
            return this;
        }

        public ChamadaItemDTOBuilder justificativa(String justificativa) {
            this.justificativa = justificativa;
            return this;
        }

        public ChamadaItemDTO build() {
            ChamadaItemDTO dto = new ChamadaItemDTO();
            dto.setAlunoId(this.alunoId);
            dto.setAlunoNome(this.alunoNome);
            dto.setAlunoCpf(this.alunoCpf);
            dto.setMatriculaId(this.matriculaId);
            dto.setStatus(this.status);
            dto.setJustificativa(this.justificativa);
            return dto;
        }
    }
}
