package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.AssigneeDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ProjectMemberRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarefaAssigneeService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaAssigneeService.class);

    private final PessoaRepository pessoaRepository;
    private final TarefaRepository tarefaRepository;
    private final TarefaMapperService tarefaMapper;
    private final ProjectMemberRepository projectMemberRepository;

    public List<AssigneeDTO> getAssigneesDisponiveis() {
        return pessoaRepository.findAll().stream()
                .map(this::toAssigneeDTO)
                .collect(Collectors.toList());
    }

    public TarefaDTO atribuirResponsavel(Long tarefaId, Long responsavelId, Boolean principal) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        Pessoa responsavel = pessoaRepository.findById(responsavelId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Responsável não encontrado com ID: " + responsavelId));

        tarefa.setResponsavel(responsavel);
        logger.info("Atribuindo tarefa ID {} ao responsável ID {} (principal: {})", tarefaId, responsavelId, principal);
        Tarefa atualizada = tarefaRepository.save(tarefa);
        return tarefaMapper.toDTO(atualizada);
    }

    /**
     * Pessoas que podem receber uma tarefa dentro de um projeto: os membros do
     * projeto. Sem projeto informado, cai para todas as pessoas do sistema.
     */
    public List<Pessoa> getAssigneesDisponiveis(Long projetoId) {
        if (projetoId == null) {
            return pessoaRepository.findAll();
        }

        return projectMemberRepository.findByProjectId(projetoId).stream()
                .map(ProjectMember::getPerson)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private AssigneeDTO toAssigneeDTO(Pessoa pessoa) {
        if (pessoa == null)
            return null;
        return new AssigneeDTO(pessoa.getId(), pessoa.getNome(), pessoa.getEmail(), null, null);
    }
}
