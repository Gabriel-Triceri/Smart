package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.model.TemplateTarefa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.repository.TemplateTarefaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
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

    public TarefaDTO toDTO(Tarefa tarefa) {
        return tarefaMapper.toDTO(tarefa);
    }

    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(tarefaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TarefaDTO buscarPorIdDTO(Long id) {
        Tarefa t = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
        return tarefaMapper.toDTO(t);
    }

    public Tarefa buscarPorId(Long id) {
        return tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
    }

    public TarefaDTO criar(TarefaDTO dto) {
        Tarefa tarefa = tarefaMapper.toEntity(dto);

        if (dto.getResponsavelId() != null) {
            pessoaRepository.findById(dto.getResponsavelId()).ifPresent(tarefa::setResponsavel);
        }
        if (dto.getReuniaoId() != null) {
            reuniaoRepository.findById(dto.getReuniaoId()).ifPresent(tarefa::setReuniao);
        }

        Tarefa salvo = tarefaRepository.save(tarefa);
        logger.info("Tarefa criada ID {}", salvo.getId());
        return tarefaMapper.toDTO(salvo);
    }

    @Transactional
    public TarefaDTO atualizar(Long id, TarefaDTO dtoAtualizada) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));

        // Capturar estado anterior para histórico
        String tituloAntigo = tarefa.getTitulo();
        String descricaoAntiga = tarefa.getDescricao();
        StatusTarefa statusAntigo = tarefa.getStatusTarefa();
        PrioridadeTarefa prioridadeAntiga = tarefa.getPrioridade();
        var prazoAntigo = tarefa.getPrazo();
        Integer progressoAntigo = tarefa.getProgresso();
        Pessoa responsavelAntigo = tarefa.getResponsavel();
        String nomeResponsavelAntigo = responsavelAntigo != null ? responsavelAntigo.getNome() : null;

        // Atualizações
        if (dtoAtualizada.getTitulo() != null)
            tarefa.setTitulo(dtoAtualizada.getTitulo());

        if (dtoAtualizada.getDescricao() != null)
            tarefa.setDescricao(dtoAtualizada.getDescricao());
        else if (tarefa.getDescricao() == null)
            tarefa.setDescricao("");

        if (dtoAtualizada.getPrazo() != null)
            tarefa.setPrazo(dtoAtualizada.getPrazo());

        tarefa.setConcluida(dtoAtualizada.isConcluida());

        if (dtoAtualizada.getStatusTarefa() != null)
            tarefa.setStatusTarefa(dtoAtualizada.getStatusTarefa());
        if (dtoAtualizada.getPrioridade() != null)
            tarefa.setPrioridade(PrioridadeTarefa.valueOf(dtoAtualizada.getPrioridade()));

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

        // Responsável
        if (dtoAtualizada.getResponsavelPrincipalId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dtoAtualizada.getResponsavelPrincipalId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: " + dtoAtualizada.getResponsavelPrincipalId()));
            tarefa.setResponsavel(responsavel);
        } else if (dtoAtualizada.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dtoAtualizada.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Responsável não encontrado com ID: " + dtoAtualizada.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        // Participantes
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

        Tarefa atualizado = tarefaRepository.save(tarefa);

        // Histórico
        try {
            historyService.registrarMudancaTitulo(tarefa, tituloAntigo, atualizado.getTitulo());
            historyService.registrarMudancaDescricao(tarefa, descricaoAntiga, atualizado.getDescricao());

            String sAntigo = statusAntigo != null ? statusAntigo.getDescricao() : null;
            String sNovo = atualizado.getStatusTarefa() != null ? atualizado.getStatusTarefa().getDescricao() : null;
            historyService.registrarMudancaStatus(tarefa, sAntigo, sNovo);

            String pAntiga = prioridadeAntiga != null ? prioridadeAntiga.getDescricao() : null;
            String pNova = atualizado.getPrioridade() != null ? atualizado.getPrioridade().getDescricao() : null;
            historyService.registrarMudancaPrioridade(tarefa, pAntiga, pNova);

            String prazoAntisoStr = prazoAntigo != null ? prazoAntigo.toString() : null;
            String prazoNovoStr = atualizado.getPrazo() != null ? atualizado.getPrazo().toString() : null;
            historyService.registrarMudancaPrazo(tarefa, prazoAntisoStr, prazoNovoStr);

            historyService.registrarMudancaProgresso(tarefa, progressoAntigo, atualizado.getProgresso());

            Pessoa respNovo = atualizado.getResponsavel();
            String nomeRespNovo = respNovo != null ? respNovo.getNome() : null;
            historyService.registrarMudancaResponsavel(tarefa, nomeResponsavelAntigo, nomeRespNovo);

        } catch (Exception e) {
            logger.error("Erro ao registrar histórico para tarefa {}: {}", id, e.getMessage());
        }

        return tarefaMapper.toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    public Reuniao getReuniaoDaTarefa(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));
        if (tarefa.getReuniao() == null) {
            throw new ResourceNotFoundException("A tarefa não está associada a nenhuma reunião.");
        }
        return tarefa.getReuniao();
    }

    @Transactional
    public TarefaDTO atualizarReuniaoDaTarefa(Long tarefaId, Long reuniaoId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        if (reuniaoId != null) {
            Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + reuniaoId));
            tarefa.setReuniao(reuniao);
        } else {
            tarefa.setReuniao(null);
        }

        Tarefa salva = tarefaRepository.save(tarefa);
        return tarefaMapper.toDTO(salva);
    }

    @Transactional
    public TarefaDTO duplicarTarefa(Long tarefaId, Map<String, Object> modificacoes) {
        Tarefa tarefaOriginal = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        Tarefa novaTarefa = new Tarefa();
        novaTarefa.setDescricao(tarefaOriginal.getDescricao() + " (Cópia)");
        novaTarefa.setPrazo(tarefaOriginal.getPrazo());
        novaTarefa.setStatusTarefa(StatusTarefa.TODO);
        novaTarefa.setConcluida(false);
        novaTarefa.setPrioridade(tarefaOriginal.getPrioridade());
        novaTarefa.setProgresso(0);

        if (tarefaOriginal.getResponsavel() != null) {
            novaTarefa.setResponsavel(tarefaOriginal.getResponsavel());
        }

        if (modificacoes != null) {
            if (modificacoes.containsKey("descricao")) {
                novaTarefa.setDescricao((String) modificacoes.get("descricao"));
            }
            if (modificacoes.containsKey("prazo")) {
                novaTarefa.setPrazo((LocalDate) modificacoes.get("prazo"));
            }
            if (modificacoes.containsKey("responsavelId")) {
                Long responsavelId = Long.valueOf(modificacoes.get("responsavelId").toString());
                Pessoa responsavel = pessoaRepository.findById(responsavelId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Responsável não encontrado com ID: " + responsavelId));
                novaTarefa.setResponsavel(responsavel);
            }
        }

        Tarefa salva = tarefaRepository.save(novaTarefa);
        return tarefaMapper.toDTO(salva);
    }

    @Transactional
    public List<TarefaDTO> criarTarefasPorTemplate(Long templateId, List<Long> responsaveisIds,
            List<String> datasVencimento, Long reuniaoId) {
        TemplateTarefa template = templateTarefaRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado com ID: " + templateId));

        List<TarefaDTO> tarefasCriadas = new ArrayList<>();

        for (int i = 0; i < responsaveisIds.size(); i++) {
            Long responsavelId = responsaveisIds.get(i);
            Pessoa responsavel = pessoaRepository.findById(responsavelId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Responsável não encontrado com ID: " + responsavelId));

            Tarefa tarefa = new Tarefa();
            tarefa.setDescricao(template.getTitulo());
            tarefa.setPrazo(datasVencimento != null && i < datasVencimento.size()
                    ? LocalDate.parse(datasVencimento.get(i))
                    : LocalDate.now().plusDays(7));
            tarefa.setStatusTarefa(StatusTarefa.TODO);
            tarefa.setConcluida(false);
            tarefa.setPrioridade(template.getPrioridade());
            tarefa.setResponsavel(responsavel);

            if (reuniaoId != null) {
                Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Reunião não encontrada com ID: " + reuniaoId));
                tarefa.setReuniao(reuniao);
            }

            Tarefa salva = tarefaRepository.save(tarefa);
            tarefasCriadas.add(tarefaMapper.toDTO(salva));
        }

        return tarefasCriadas;
    }
}
