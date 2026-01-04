package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.model.TemplateTarefa;
import com.smartmeeting.repository.*;
import com.smartmeeting.service.kanban.KanbanColumnInitializationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarefaCrudService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaCrudService.class);

    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;
    private final ReuniaoRepository reuniaoRepository;
    private final TemplateTarefaRepository templateTarefaRepository;
    private final TarefaMapperService tarefaMapper;
    private final TarefaHistoryService historyService;
    private final ProjectRepository projectRepository;
    private final KanbanColumnDynamicRepository columnRepository;
    private final KanbanColumnInitializationService columnInitializationService;

    public TarefaDTO toDTO(Tarefa tarefa) {
        return tarefaMapper.toDTO(tarefa);
    }

    @Transactional(readOnly = true)
    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll()
                .stream()
                .map(tarefaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TarefaDTO buscarPorIdDTO(Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + id));
        return tarefaMapper.toDTO(tarefa);
    }

    public Tarefa buscarPorId(Long id) {
        return tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + id));
    }

    @Transactional
    public TarefaDTO criar(TarefaDTO dto) {
        Tarefa tarefa = tarefaMapper.toEntity(dto);

        if (dto.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dto.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: " + dto.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dto.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dto.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Reunião não encontrada com ID: " + dto.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        // Tentar obter o projeto pelo DTO ou pela reunião
        Long projectIdDto = dto.getProjectId();
        if (projectIdDto == null && tarefa.getReuniao() != null && tarefa.getReuniao().getProject() != null) {
            projectIdDto = tarefa.getReuniao().getProject().getId();
        }

        final Long finalProjectId = projectIdDto;
        if (finalProjectId != null) {
            projectRepository.findById(finalProjectId).ifPresent(project -> {
                tarefa.setProject(project);

                // Garantir que o projeto tenha colunas (inicializa se estiver vazio)
                if (!columnRepository.existsByProjectId(finalProjectId)) {
                    columnInitializationService.initializeDefaultColumns(finalProjectId);
                }

                // Atribuir coluna padrão do projeto
                columnRepository.findByProjectIdAndIsDefaultTrue(finalProjectId)
                        .ifPresent(tarefa::setColumn);
            });
        }

        // Processar participantes adicionais (responsaveisIds)
        if (dto.getResponsaveisIds() != null && !dto.getResponsaveisIds().isEmpty()) {
            Set<Pessoa> participantes = new HashSet<>();
            Long principalId = tarefa.getResponsavel() != null ? tarefa.getResponsavel().getId() : null;

            for (String idStr : dto.getResponsaveisIds()) {
                try {
                    Long pessoaId = Long.parseLong(idStr);
                    // Evitar adicionar o responsável principal também como participante
                    if (principalId != null && pessoaId.equals(principalId)) {
                        continue;
                    }

                    pessoaRepository.findById(pessoaId).ifPresent(participantes::add);
                } catch (NumberFormatException e) {
                    logger.warn("ID de participante inválido na criação: {}", idStr);
                }
            }
            tarefa.setParticipantes(participantes);
        }

        Tarefa salvo = tarefaRepository.save(tarefa);
        logger.info("Tarefa criada ID {}", salvo.getId());
        return tarefaMapper.toDTO(salvo);
    }

    @Transactional
    public Tarefa atualizarReuniaoDaTarefa(Long tarefaId, Long reuniaoId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + tarefaId));

        Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reunião não encontrada com ID: " + reuniaoId));

        tarefa.setReuniao(reuniao);
        return tarefaRepository.save(tarefa);
    }

    @Transactional
    public TarefaDTO atualizar(Long id, TarefaDTO dtoAtualizada) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + id));

        final Tarefa tarefaOriginal = tarefa;

        String tituloAntigo = tarefa.getTitulo();
        String descricaoAntiga = tarefa.getDescricao();
        String colunaAntiga = tarefa.getColumn() != null ? tarefa.getColumn().getTitle() : null;
        PrioridadeTarefa prioridadeAntiga = tarefa.getPrioridade();
        LocalDate prazoAntigo = tarefa.getPrazo();
        Integer progressoAntigo = tarefa.getProgresso();
        Pessoa responsavelAntigo = tarefa.getResponsavel();
        String nomeResponsavelAntigo = responsavelAntigo != null ? responsavelAntigo.getNome() : null;

        if (dtoAtualizada.getTitulo() != null)
            tarefa.setTitulo(dtoAtualizada.getTitulo());

        if (dtoAtualizada.getDescricao() != null)
            tarefa.setDescricao(dtoAtualizada.getDescricao());
        else if (tarefa.getDescricao() == null)
            tarefa.setDescricao("");

        if (dtoAtualizada.getPrazo() != null)
            tarefa.setPrazo(dtoAtualizada.getPrazo());

        tarefa.setConcluida(dtoAtualizada.isConcluida());

        if (dtoAtualizada.getPrioridade() != null)
            tarefa.setPrioridade(
                    PrioridadeTarefa.fromValue(dtoAtualizada.getPrioridade()));

        if (dtoAtualizada.getDataInicio() != null)
            tarefa.setDataInicio(dtoAtualizada.getDataInicio());

        if (dtoAtualizada.getEstimadoHoras() != null)
            tarefa.setEstimadoHoras(dtoAtualizada.getEstimadoHoras());

        if (dtoAtualizada.getTags() != null)
            tarefa.setTags(dtoAtualizada.getTags());

        if (dtoAtualizada.getCor() != null)
            tarefa.setCor(dtoAtualizada.getCor());

        if (dtoAtualizada.getProgresso() != null)
            tarefa.setProgresso(dtoAtualizada.getProgresso());

        if (dtoAtualizada.getResponsavelPrincipalId() != null) {
            Pessoa responsavel = pessoaRepository
                    .findById(dtoAtualizada.getResponsavelPrincipalId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: "
                                    + dtoAtualizada.getResponsavelPrincipalId()));
            tarefa.setResponsavel(responsavel);
        } else if (dtoAtualizada.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository
                    .findById(dtoAtualizada.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: "
                                    + dtoAtualizada.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dtoAtualizada.getResponsaveisIds() != null) {
            Set<Pessoa> participantes = new HashSet<>();
            Long principalId = tarefa.getResponsavel() != null ? tarefa.getResponsavel().getId() : null;

            for (String idStr : dtoAtualizada.getResponsaveisIds()) {
                try {
                    Long pessoaId = Long.parseLong(idStr);
                    if (principalId != null && pessoaId.equals(principalId))
                        continue;

                    Pessoa participante = pessoaRepository.findById(pessoaId)
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Participante não encontrado com ID: " + pessoaId));
                    participantes.add(participante);
                } catch (NumberFormatException e) {
                    logger.warn("ID de participante inválido: {}", idStr);
                }
            }
            tarefa.setParticipantes(participantes);
        }

        if (dtoAtualizada.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dtoAtualizada.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Reunião não encontrada com ID: " + dtoAtualizada.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        if (dtoAtualizada.getColumnId() != null) {
            columnRepository.findById(dtoAtualizada.getColumnId())
                    .ifPresent(tarefa::setColumn);
        }

        Tarefa atualizado = tarefaRepository.save(tarefa);

        try {
            historyService.registrarMudancaTitulo(
                    tarefaOriginal, tituloAntigo, atualizado.getTitulo());
            historyService.registrarMudancaDescricao(
                    tarefaOriginal, descricaoAntiga, atualizado.getDescricao());

            String colunaNova = atualizado.getColumn() != null ? atualizado.getColumn().getTitle() : null;
            historyService.registrarMudancaStatus(
                    tarefaOriginal, colunaAntiga, colunaNova);

            String pAntiga = prioridadeAntiga != null ? prioridadeAntiga.getDescricao() : null;
            String pNova = atualizado.getPrioridade() != null
                    ? atualizado.getPrioridade().getDescricao()
                    : null;
            historyService.registrarMudancaPrioridade(
                    tarefaOriginal, pAntiga, pNova);

            historyService.registrarMudancaPrazo(
                    tarefaOriginal,
                    prazoAntigo != null ? prazoAntigo.toString() : null,
                    atualizado.getPrazo() != null
                            ? atualizado.getPrazo().toString()
                            : null);

            historyService.registrarMudancaProgresso(
                    tarefaOriginal, progressoAntigo, atualizado.getProgresso());

            Pessoa respNovo = atualizado.getResponsavel();
            historyService.registrarMudancaResponsavel(
                    tarefaOriginal,
                    nomeResponsavelAntigo,
                    respNovo != null ? respNovo.getNome() : null);

        } catch (Exception e) {
            logger.error(
                    "Erro ao registrar histórico para tarefa {}: {}",
                    id,
                    e.getMessage());
        }

        return tarefaMapper.toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    @Transactional
    public TarefaDTO duplicarTarefa(Long tarefaId, Map<String, Object> modificacoes) {
        Tarefa original = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + tarefaId));

        Tarefa nova = new Tarefa();
        nova.setDescricao(original.getDescricao() + " (Cópia)");
        nova.setPrazo(original.getPrazo());
        nova.setConcluida(false);
        nova.setPrioridade(original.getPrioridade());
        nova.setProgresso(0);
        nova.setResponsavel(original.getResponsavel());
        nova.setColumn(original.getColumn());

        if (modificacoes != null) {
            if (modificacoes.containsKey("descricao"))
                nova.setDescricao((String) modificacoes.get("descricao"));
            if (modificacoes.containsKey("prazo"))
                nova.setPrazo((LocalDate) modificacoes.get("prazo"));
        }

        return tarefaMapper.toDTO(tarefaRepository.save(nova));
    }

    @Transactional
    public List<TarefaDTO> criarTarefasPorTemplate(
            Long templateId,
            List<Long> responsaveisIds,
            List<String> datasVencimento,
            Long reuniaoId) {

        TemplateTarefa template = templateTarefaRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Template não encontrado com ID: " + templateId));

        List<TarefaDTO> criadas = new ArrayList<>();

        for (int i = 0; i < responsaveisIds.size(); i++) {
            final Long responsavelId = responsaveisIds.get(i); // tornamos final/effectively final
            Pessoa responsavel = pessoaRepository.findById(responsavelId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: " + responsavelId));

            Tarefa tarefa = new Tarefa();
            tarefa.setDescricao(template.getTitulo());
            tarefa.setPrazo(
                    datasVencimento != null && i < datasVencimento.size()
                            ? LocalDate.parse(datasVencimento.get(i))
                            : LocalDate.now().plusDays(7));
            tarefa.setConcluida(false);
            tarefa.setPrioridade(template.getPrioridade());
            tarefa.setResponsavel(responsavel);

            if (reuniaoId != null) {
                final Long rid = reuniaoId; // safe to capture
                tarefa.setReuniao(
                        reuniaoRepository.findById(rid)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Reunião não encontrada com ID: " + rid)));

                // Atribuir coluna padrão se houver projeto
                if (tarefa.getReuniao().getProject() != null) {
                    tarefa.setProject(tarefa.getReuniao().getProject());
                    columnRepository.findByProjectIdAndIsDefaultTrue(tarefa.getProject().getId())
                            .ifPresent(tarefa::setColumn);
                }
            }

            criadas.add(tarefaMapper.toDTO(tarefaRepository.save(tarefa)));
        }

        return criadas;
    }

    @Transactional(readOnly = true)
    public Reuniao getReuniaoDaTarefa(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarefa não encontrada com ID: " + tarefaId));
        return tarefa.getReuniao();
    }
}
