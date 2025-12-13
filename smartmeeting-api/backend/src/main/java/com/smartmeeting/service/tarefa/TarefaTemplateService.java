package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TemplateTarefaDTO;
import com.smartmeeting.model.TemplateTarefa;
import com.smartmeeting.repository.TemplateTarefaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarefaTemplateService {

    private final TemplateTarefaRepository templateRepo;

    public TarefaTemplateService(TemplateTarefaRepository templateRepo) {
        this.templateRepo = templateRepo;
    }

    public List<TemplateTarefaDTO> getTemplates() {
        return templateRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TemplateTarefaDTO toDTO(TemplateTarefa template) {
        if (template == null)
            return null;
        return new TemplateTarefaDTO(
                template.getId(),
                template.getTitulo(),
                template.getDescricao(),
                template.getPrioridade(),
                template.getTags(),
                template.getEstimadaHoras(),
                template.getDependencias());
    }
}
