package com.smartmeeting.service;

import com.smartmeeting.dto.AssigneeDTO; // Importar o novo DTO
import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.KanbanColumnDTO;
import com.smartmeeting.dto.MovimentacaoTarefaDTO; // Importar o novo DTO de movimentação
import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.dto.TarefaStatisticsDTO;
import com.smartmeeting.dto.TemplateTarefaDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.NotificacaoTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.model.TemplateTarefa;
import org.springframework.web.multipart.MultipartFile;
import com.smartmeeting.repository.NotificacaoTarefaRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.repository.TemplateTarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaService.class);

    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;
    private final ReuniaoRepository reuniaoRepository;
    private final NotificacaoTarefaRepository notificacaoTarefaRepository;
    private final TemplateTarefaRepository templateTarefaRepository;
    private final com.smartmeeting.repository.ComentarioTarefaRepository comentarioTarefaRepository;
    private final com.smartmeeting.repository.AnexoTarefaRepository anexoTarefaRepository;
    private final TarefaHistoryService historyService;

    public TarefaService(TarefaRepository tarefaRepository,
            PessoaRepository pessoaRepository,
            ReuniaoRepository reuniaoRepository,
            NotificacaoTarefaRepository notificacaoTarefaRepository,
            TemplateTarefaRepository templateTarefaRepository,
            com.smartmeeting.repository.ComentarioTarefaRepository comentarioTarefaRepository,
            com.smartmeeting.repository.AnexoTarefaRepository anexoTarefaRepository,
            TarefaHistoryService historyService) {
        this.tarefaRepository = tarefaRepository;
        this.pessoaRepository = pessoaRepository;
        this.reuniaoRepository = reuniaoRepository;
        this.notificacaoTarefaRepository = notificacaoTarefaRepository;
        this.templateTarefaRepository = templateTarefaRepository;
        this.comentarioTarefaRepository = comentarioTarefaRepository;
        this.anexoTarefaRepository = anexoTarefaRepository;
        this.historyService = historyService;
    }

    /**
     * Converte uma entidade Tarefa para seu respectivo DTO
     *
     * @param tarefa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    public TarefaDTO toDTO(Tarefa tarefa) {
        if (tarefa == null)
            return null;
        TarefaDTO dto = new TarefaDTO();
        dto.setId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrazo(tarefa.getPrazo());
        dto.setPrazo_tarefa(tarefa.getPrazo() != null ? tarefa.getPrazo().toString() : null); // Compatibilidade
        // frontend
        dto.setConcluida(tarefa.isConcluida());
        // Garante que statusTarefa nunca seja nulo no DTO
        dto.setStatusTarefa(tarefa.getStatusTarefa() != null ? tarefa.getStatusTarefa() : StatusTarefa.TODO);

        dto.setPrioridade(tarefa.getPrioridade() != null ? tarefa.getPrioridade().name() : null);
        dto.setDataInicio(tarefa.getDataInicio());
        dto.setEstimadoHoras(tarefa.getEstimadoHoras());
        dto.setTags(tarefa.getTags());
        dto.setCor(tarefa.getCor());

        // Campos básicos
        // Se o título for nulo (tarefas antigas), usa a descrição (ou parte dela) como
        // fallback
        dto.setTitulo(tarefa.getTitulo() != null && !tarefa.getTitulo().isEmpty() ? tarefa.getTitulo()
                : tarefa.getDescricao());

        // Progresso real
        dto.setProgresso(tarefa.getProgresso() != null ? tarefa.getProgresso() : 0);

        // Auditoria
        dto.setCriadaPor(tarefa.getCreatedBy());
        dto.setCreatedAt(tarefa.getCreatedDate());
        dto.setAtualizadaPor(tarefa.getLastModifiedBy());
        dto.setUpdatedAt(tarefa.getLastModifiedDate());

        // Tentar buscar nomes dos usuários de auditoria (opcional, pode ser custoso)
        // Por enquanto, vamos deixar os nomes iguais aos IDs/Usernames ou null
        dto.setCriadaPorNome(tarefa.getCreatedBy());
        dto.setAtualizadaPorNome(tarefa.getLastModifiedBy());

        // Campos vazios por enquanto (não existem na entidade)
        dto.setHorasTrabalhadas(0.0);
        dto.setSubtarefas(new ArrayList<>());
        dto.setDependencias(new ArrayList<>());

        // Carregar Comentários
        List<com.smartmeeting.dto.ComentarioTarefaDTO> comentariosDTO = comentarioTarefaRepository
                .findByTarefaId(tarefa.getId())
                .stream()
                .map(c -> new com.smartmeeting.dto.ComentarioTarefaDTO()
                        .setId(c.getId())
                        .setTarefaId(c.getTarefa().getId())
                        .setAutorId(c.getAutor().getId())
                        .setAutorNome(c.getAutor().getNome())
                        // .setAutorAvatar(c.getAutor().getAvatar()) // Avatar não existe em Pessoa
                        .setConteudo(c.getTexto())
                        .setCreatedAt(c.getDataCriacao())
                        .setMencoes(new ArrayList<>()) // Mencoes não implementado no modelo simples
                        .setAnexos(new ArrayList<>())) // Anexos de comentário não implementado
                .collect(Collectors.toList());
        dto.setComentarios(comentariosDTO);

        // Carregar Anexos
        List<com.smartmeeting.dto.AnexoTarefaDTO> anexosDTO = anexoTarefaRepository.findByTarefaId(tarefa.getId())
                .stream()
                .map(a -> new com.smartmeeting.dto.AnexoTarefaDTO()
                        .setId(a.getId())
                        .setNome(a.getNomeArquivo())
                        .setTipo(a.getTipoArquivo())
                        .setUrl(a.getUrl())
                        .setTamanho(a.getTamanhoArquivo())
                        .setUploadedBy(a.getAutor().getId().toString())
                        .setUploadedByNome(a.getAutor().getNome())
                        .setCreatedAt(a.getDataUpload()))
                .collect(Collectors.toList());
        dto.setAnexos(anexosDTO);

        // Safely get Responsavel ID (Principal)
        List<AssigneeDTO> responsaveisList = new ArrayList<>();
        java.util.Set<Long> idsAdicionados = new java.util.HashSet<>();

        if (tarefa.getResponsavel() != null) {
            try {
                dto.setResponsavelId(tarefa.getResponsavel().getId());
                dto.setResponsavelNome(tarefa.getResponsavel().getNome());
                dto.setResponsavelPrincipalId(tarefa.getResponsavel().getId());

                // Adicionar o responsável principal à lista
                responsaveisList.add(toAssigneeDTO(tarefa.getResponsavel()));
                idsAdicionados.add(tarefa.getResponsavel().getId());
            } catch (Exception e) {
                logger.error("Error getting responsavel ID for Tarefa {}: {}", tarefa.getId(), e.getMessage(), e);
                dto.setResponsavelId(null);
                dto.setResponsavelPrincipalId(null);
            }
        } else {
            dto.setResponsavelId(null);
            dto.setResponsavelPrincipalId(null);
        }

        // Adicionar participantes (que não sejam o responsável principal)
        if (tarefa.getParticipantes() != null && !tarefa.getParticipantes().isEmpty()) {
            for (Pessoa participante : tarefa.getParticipantes()) {
                if (!idsAdicionados.contains(participante.getId())) {
                    responsaveisList.add(toAssigneeDTO(participante));
                    idsAdicionados.add(participante.getId());
                }
            }
        }

        dto.setResponsaveis(responsaveisList);

        // Safely get Reuniao ID and Titulo
        if (tarefa.getReuniao() != null) {
            try {
                dto.setReuniaoId(tarefa.getReuniao().getId());
                dto.setReuniaoTitulo(tarefa.getReuniao().getTitulo());
            } catch (Exception e) {
                // Log the error or handle it appropriately, e.g., set to null
                logger.error("Error getting reuniao info for Tarefa {}: {}", tarefa.getId(), e.getMessage(), e);
                dto.setReuniaoId(null);
                dto.setReuniaoTitulo(null);
            }
        } else {
            dto.setReuniaoId(null);
            dto.setReuniaoTitulo(null);
        }

        // Safely get Project ID and Name
        if (tarefa.getProject() != null) {
            try {
                dto.setProjectId(tarefa.getProject().getId());
                dto.setProjectName(tarefa.getProject().getName());
            } catch (Exception e) {
                logger.error("Error getting project info for Tarefa {}: {}", tarefa.getId(), e.getMessage(), e);
                dto.setProjectId(null);
                dto.setProjectName(null);
            }
        } else {
            dto.setProjectId(null);
            dto.setProjectName(null);
        }
        return dto;
    }

    /**
     * Converte um DTO para a entidade Tarefa
     *
     * @param dto DTO contendo os dados da tarefa
     * @return Entidade Tarefa correspondente ou null se o DTO for nulo
     */
    public Tarefa toEntity(TarefaDTO dto) {
        if (dto == null)
            return null;
        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setConcluida(dto.isConcluida());
        tarefa.setStatusTarefa(dto.getStatusTarefa());
        if (dto.getPrioridade() != null) {
            tarefa.setPrioridade(PrioridadeTarefa.valueOf(dto.getPrioridade()));
        }
        tarefa.setDataInicio(dto.getDataInicio());
        tarefa.setEstimadoHoras(dto.getEstimadoHoras());
        tarefa.setTags(dto.getTags());
        tarefa.setCor(dto.getCor());
        tarefa.setProgresso(dto.getProgresso() != null ? dto.getProgresso() : 0);

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

        return tarefa;
    }

    // --- Métodos CRUD usando DTOs ---
    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TarefaDTO buscarPorIdDTO(Long id) {
        return tarefaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
    }

    public List<TarefaDTO> listarTodasDTO() {
        return listarTodas();
    }

    public TarefaDTO criar(TarefaDTO dto) {
        Tarefa tarefa = toEntity(dto);
        Tarefa salvo = tarefaRepository.save(tarefa);
        return toDTO(salvo);
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
        LocalDate prazoAntigo = tarefa.getPrazo();
        Integer progressoAntigo = tarefa.getProgresso();
        Pessoa responsavelAntigo = tarefa.getResponsavel();
        String nomeResponsavelAntigo = responsavelAntigo != null ? responsavelAntigo.getNome() : null;

        // Atualiza apenas campos que foram fornecidos (não sobrescreve com null)

        // Título: atualiza se fornecido
        if (dtoAtualizada.getTitulo() != null) {
            tarefa.setTitulo(dtoAtualizada.getTitulo());
        }

        // Para descricao: aceita string vazia (usuário pode querer limpar a descrição)
        if (dtoAtualizada.getDescricao() != null) {
            tarefa.setDescricao(dtoAtualizada.getDescricao());
        } else if (tarefa.getDescricao() == null) {
            // Se não foi fornecido e o valor atual é null, define como string vazia
            tarefa.setDescricao("");
        }

        if (dtoAtualizada.getPrazo() != null) {
            tarefa.setPrazo(dtoAtualizada.getPrazo());
        }
        // concluida é primitivo boolean, sempre tem valor
        tarefa.setConcluida(dtoAtualizada.isConcluida());
        if (dtoAtualizada.getStatusTarefa() != null) {
            tarefa.setStatusTarefa(dtoAtualizada.getStatusTarefa());
        }
        if (dtoAtualizada.getPrioridade() != null) {
            tarefa.setPrioridade(PrioridadeTarefa.valueOf(dtoAtualizada.getPrioridade()));
        }
        if (dtoAtualizada.getDataInicio() != null) {
            tarefa.setDataInicio(dtoAtualizada.getDataInicio());
        }
        if (dtoAtualizada.getEstimadoHoras() != null) {
            tarefa.setEstimadoHoras(dtoAtualizada.getEstimadoHoras());
        }
        if (dtoAtualizada.getTags() != null) {
            tarefa.setTags(dtoAtualizada.getTags());
        }
        if (dtoAtualizada.getCor() != null) {
            tarefa.setCor(dtoAtualizada.getCor());
        }
        if (dtoAtualizada.getProgresso() != null) {
            tarefa.setProgresso(dtoAtualizada.getProgresso());
        }

        // Atualizar responsável principal
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

        // Atualizar participantes (responsaveisIds contém todos os IDs, incluindo o
        // principal)
        if (dtoAtualizada.getResponsaveisIds() != null) {
            java.util.Set<Pessoa> participantes = new java.util.HashSet<>();
            Long principalId = tarefa.getResponsavel() != null ? tarefa.getResponsavel().getId() : null;

            for (String idStr : dtoAtualizada.getResponsaveisIds()) {
                try {
                    Long pessoaId = Long.parseLong(idStr);
                    // Não adicionar o principal na lista de participantes (ele já está em
                    // responsavel)
                    if (principalId != null && pessoaId.equals(principalId)) {
                        continue;
                    }
                    Pessoa participante = pessoaRepository.findById(pessoaId)
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Participante não encontrado com ID: " + pessoaId));
                    participantes.add(participante);
                } catch (NumberFormatException e) {
                    logger.warn("ID de participante inválido: {}", idStr);
                }
            }
            tarefa.setParticipantes(participantes);
            logger.info("Participantes atualizados para tarefa {}: {} participantes", id, participantes.size());
        }

        if (dtoAtualizada.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dtoAtualizada.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Reunião não encontrada com ID: " + dtoAtualizada.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        Tarefa atualizado = tarefaRepository.save(tarefa);

        // Registrar alterações no histórico
        try {
            // 1. Título
            historyService.registrarMudancaTitulo(tarefa, tituloAntigo, atualizado.getTitulo());

            // 2. Descrição
            historyService.registrarMudancaDescricao(tarefa, descricaoAntiga, atualizado.getDescricao());

            // 3. Status
            String sAntigo = statusAntigo != null ? statusAntigo.getDescricao() : null;
            String sNovo = atualizado.getStatusTarefa() != null ? atualizado.getStatusTarefa().getDescricao() : null;
            historyService.registrarMudancaStatus(tarefa, sAntigo, sNovo);

            // 4. Prioridade
            String pAntiga = prioridadeAntiga != null ? prioridadeAntiga.getDescricao() : null;
            String pNova = atualizado.getPrioridade() != null ? atualizado.getPrioridade().getDescricao() : null;
            historyService.registrarMudancaPrioridade(tarefa, pAntiga, pNova);

            // 5. Prazo
            String prazoAntisoStr = prazoAntigo != null ? prazoAntigo.toString() : null;
            String prazoNovoStr = atualizado.getPrazo() != null ? atualizado.getPrazo().toString() : null;
            historyService.registrarMudancaPrazo(tarefa, prazoAntisoStr, prazoNovoStr);

            // 6. Progresso
            historyService.registrarMudancaProgresso(tarefa, progressoAntigo, atualizado.getProgresso());

            // 7. Responsável
            Pessoa respNovo = atualizado.getResponsavel();
            String nomeRespNovo = respNovo != null ? respNovo.getNome() : null;
            historyService.registrarMudancaResponsavel(tarefa, nomeResponsavelAntigo, nomeRespNovo);

        } catch (Exception e) {
            logger.error("Erro ao registrar histórico para tarefa {}: {}", id, e.getMessage());
        }

        return toDTO(atualizado);
    }

    /**
     * Lista todas as tarefas de uma reunião específica
     *
     * @param reuniaoId ID da reunião para filtrar as tarefas
     * @return Lista de TarefaDTO pertencentes à reunião
     */
    public List<TarefaDTO> getTarefasPorReuniao(Long reuniaoId) {
        // Verifica se a reunião existe
        reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + reuniaoId));

        // Busca as tarefas da reunião e converte para DTO
        return tarefaRepository.findByReuniaoId(reuniaoId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deletar(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    public String verificarPendencias(Long idReuniao) {
        reuniaoRepository.findById(idReuniao)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + idReuniao));

        List<Tarefa> tarefas = tarefaRepository.findByReuniaoId(idReuniao);
        boolean temPendencias = tarefas.stream().anyMatch(t -> !t.isConcluida());
        return temPendencias ? "Existem tarefas pendentes." : "Todas as tarefas estão concluídas.";
    }

    /**
     * Obtém a reunião associada a uma tarefa
     *
     * @param tarefaId ID da tarefa
     * @return A reunião associada
     * @throws ResourceNotFoundException se a tarefa ou a reunião não forem
     *                                   encontradas
     */
    public Reuniao getReuniaoDaTarefa(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        if (tarefa.getReuniao() == null) {
            throw new ResourceNotFoundException("A tarefa não está associada a nenhuma reunião.");
        }

        return tarefa.getReuniao();
    }

    /**
     * Atualiza a reunião associada a uma tarefa
     *
     * @param tarefaId  ID da tarefa
     * @param reuniaoId ID da reunião (pode ser null para desvincular)
     * @return A tarefa atualizada
     */
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
        return toDTO(salva);
    }

    // --- Métodos de Notificação ---
    @Transactional
    public List<NotificacaoTarefaDTO> getNotificacoesTarefas() {
        return notificacaoTarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NotificacaoTarefaDTO toDTO(NotificacaoTarefa notificacao) {
        if (notificacao == null)
            return null;
        return new NotificacaoTarefaDTO(
                notificacao.getId(),
                notificacao.getTarefa() != null ? notificacao.getTarefa().getId() : null,
                notificacao.getUsuario() != null ? notificacao.getUsuario().getId() : null,
                notificacao.getTipo(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.isLida(),
                notificacao.getCreatedAt(),
                notificacao.getAgendadaPara());
    }

    // --- Métodos de Template de Tarefas ---
    public List<TemplateTarefaDTO> getTemplatesTarefas() {
        return templateTarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
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

    // --- Métodos de Estatísticas de Tarefas ---
    @Transactional
    public TarefaStatisticsDTO getTarefaStatistics() {
        List<Tarefa> todasTarefas = tarefaRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = todasTarefas.size();

        Map<StatusTarefa, Long> porStatus = todasTarefas.stream()
                .map(this::withDefaultStatus)
                .collect(Collectors.groupingBy(Tarefa::getStatusTarefa, Collectors.counting()));

        Map<PrioridadeTarefa, Long> porPrioridade = todasTarefas.stream()
                .map(this::withDefaultPrioridade)
                .collect(Collectors.groupingBy(Tarefa::getPrioridade, Collectors.counting()));

        List<TarefaStatisticsDTO.ResponsavelStatsDTO> porResponsavel = todasTarefas.stream()
                .filter(t -> t.getResponsavel() != null)
                .collect(Collectors.groupingBy(t -> t.getResponsavel().getNome(),
                        Collectors.collectingAndThen(Collectors.toList(), tarefasDoResponsavel -> {
                            long totalResp = tarefasDoResponsavel.size();
                            long concluidasResp = tarefasDoResponsavel.stream()
                                    .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                                    .count();
                            return new TarefaStatisticsDTO.ResponsavelStatsDTO(
                                    tarefasDoResponsavel.get(0).getResponsavel().getNome(), totalResp, concluidasResp);
                        })))
                .values().stream().collect(Collectors.toList());

        long tarefasConcluidas = todasTarefas.stream()
                .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                .count();
        double taxaConclusao = total > 0 ? (double) tarefasConcluidas / total : 0.0;

        long tarefasVencendo = todasTarefas.stream()
                .filter(t -> t.getPrazo() != null && t.getPrazo().isAfter(now.toLocalDate())
                        && t.getPrazo().isBefore(now.toLocalDate().plusDays(3))
                        && t.getStatusTarefa() != StatusTarefa.DONE)
                .count();

        long tarefasAtrasadas = todasTarefas.stream()
                .filter(t -> t.getPrazo() != null && t.getPrazo().isBefore(now.toLocalDate())
                        && t.getStatusTarefa() != StatusTarefa.DONE)
                .count();

        // Placeholder para mediaTempoConclusao e produtividadeSemana
        double mediaTempoConclusao = 0.0;
        List<TarefaStatisticsDTO.ProdutividadeSemanaDTO> produtividadeSemana = List.of();

        return new TarefaStatisticsDTO(
                total,
                porStatus,
                porPrioridade,
                porResponsavel,
                taxaConclusao,
                tarefasVencendo,
                tarefasAtrasadas,
                mediaTempoConclusao,
                produtividadeSemana);
    }

    // --- Métodos do Kanban Board ---
    @Transactional
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId) {
        try {
            logger.info("Attempting to retrieve Kanban Board for reuniaoId: {}", reuniaoId);
            List<Tarefa> tarefas;
            if (reuniaoId != null) {
                tarefas = tarefaRepository.findByReuniaoId(reuniaoId);
                logger.debug("Found {} tasks for reuniaoId: {}", tarefas.size(), reuniaoId);
            } else {
                tarefas = tarefaRepository.findAll();
                logger.debug("Found {} total tasks (no reuniaoId specified)", tarefas.size());
            }

            Map<StatusTarefa, List<TarefaDTO>> tarefasPorStatus = tarefas.stream()
                    .map(this::toDTO)
                    .collect(Collectors.groupingBy(TarefaDTO::getStatusTarefa));
            logger.debug("Grouped tasks by status. Number of status groups: {}", tarefasPorStatus.size());

            List<KanbanColumnDTO> colunas = Arrays.stream(StatusTarefa.values())
                    .map(status -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorStatus.getOrDefault(status, List.of());
                        // Definir uma cor e ordem para cada status (exemplo)
                        String cor;
                        int ordem;
                        switch (status) {
                            case TODO:
                                cor = "#FFC107";
                                ordem = 1;
                                break; // Amarelo
                            case IN_PROGRESS:
                                cor = "#2196F3";
                                ordem = 2;
                                break; // Azul
                            case REVIEW:
                                cor = "#9C27B0";
                                ordem = 3;
                                break; // Roxo
                            case DONE:
                                cor = "#4CAF50";
                                ordem = 4;
                                break; // Verde
                            default:
                                throw new IllegalStateException("Status de tarefa inesperado: " + status);
                        }
                        logger.trace("Creating KanbanColumnDTO for status {}: {} tasks", status,
                                tarefasDaColuna.size());
                        return new KanbanColumnDTO(status, status.getDescricao(), tarefasDaColuna, null, cor, ordem);
                    })
                    .sorted(Comparator.comparingInt(KanbanColumnDTO::getOrdem))
                    .collect(Collectors.toList());
            logger.debug("Created {} Kanban columns.", colunas.size());

            return new KanbanBoardDTO(
                    "kanban-board-principal", // ID fixo para o board principal
                    "Board de Tarefas",
                    reuniaoId,
                    colunas,
                    LocalDateTime.now(),
                    LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for reuniaoId {}: {}", reuniaoId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e); // Re-throw as a runtime exception or a
            // custom exception
        }
    }

    // --- Métodos para Assignees ---
    public List<AssigneeDTO> getAssigneesDisponiveis() {
        return pessoaRepository.findAll().stream()
                .map(this::toAssigneeDTO)
                .collect(Collectors.toList());
    }

    private Tarefa withDefaultStatus(Tarefa tarefa) {
        if (tarefa.getStatusTarefa() == null) {
            tarefa.setStatusTarefa(StatusTarefa.TODO);
        }
        return tarefa;
    }

    private Tarefa withDefaultPrioridade(Tarefa tarefa) {
        if (tarefa.getPrioridade() == null) {
            tarefa.setPrioridade(PrioridadeTarefa.MEDIA);
        }
        return tarefa;
    }

    public AssigneeDTO toAssigneeDTO(Pessoa pessoa) {
        if (pessoa == null)
            return null;
        return new AssigneeDTO(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getEmail(),
                null, // Avatar não está na entidade Pessoa
                null // Departamento não está na entidade Pessoa
        );
    }

    /**
     * Move uma tarefa para um novo status e, opcionalmente, uma nova posição.
     *
     * @param id          O ID da tarefa a ser movida.
     * @param newStatus   O novo status da tarefa.
     * @param newPosition A nova posição da tarefa dentro do status (opcional).
     * @return A TarefaDTO atualizada.
     */
    @Transactional
    public TarefaDTO moverTarefa(Long id, StatusTarefa newStatus, Integer newPosition) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));

        logger.info("Movendo tarefa ID {} de status {} para {}", id, tarefa.getStatusTarefa(), newStatus);

        StatusTarefa statusAntigo = tarefa.getStatusTarefa();

        tarefa.setStatusTarefa(newStatus);
        // Se houver necessidade de reordenar tarefas dentro de um status, a lógica
        // seria implementada aqui.
        // Por enquanto, apenas a mudança de status é tratada.
        // tarefa.setPosition(newPosition); // Se a entidade Tarefa tivesse um campo
        // 'position'

        Tarefa updatedTarefa = tarefaRepository.save(tarefa);

        // Registrar histórico de mudança de status
        try {
            historyService.registrarMudancaStatus(
                    tarefa,
                    statusAntigo != null ? statusAntigo.getDescricao() : null,
                    newStatus != null ? newStatus.getDescricao() : null);
        } catch (Exception e) {
            logger.error("Erro ao registrar histórico de movimentação para tarefa {}: {}", id, e.getMessage());
        }

        return toDTO(updatedTarefa);
    }

    /**
     * Registra uma movimentação de tarefa.
     * Por enquanto, apenas loga a movimentação. Pode ser estendido para
     * persistência futura.
     *
     * @param dto DTO contendo os detalhes da movimentação.
     */
    public void registrarMovimentacao(MovimentacaoTarefaDTO dto) {
        logger.info(
                "Movimentação de Tarefa Registrada: Tarefa ID={}, De Status={}, Para Status={}, Usuário={}, Timestamp={}",
                dto.getTarefaId(), dto.getStatusAnterior(), dto.getStatusNovo(), dto.getUsuarioNome(),
                dto.getTimestamp());
        // Futuramente, aqui poderia haver a lógica para salvar a movimentação em um
        // banco de dados
        // Ex: movimentacaoTarefaRepository.save(toEntity(dto));
    }

    /**
     * Adiciona um comentário a uma tarefa
     *
     * @param tarefaId ID da tarefa
     * @param conteudo Conteúdo do comentário
     * @param mencoes  Lista de menções (usernames ou IDs de usuários)
     * @return Map com informações do comentário criado
     */
    @Transactional
    public Map<String, Object> adicionarComentario(Long tarefaId, String conteudo, List<String> mencoes) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        // Validação básica
        if (conteudo == null || conteudo.trim().isEmpty()) {
            throw new IllegalArgumentException("O conteúdo do comentário não pode ser vazio");
        }

        // Log da ação
        logger.info("Adicionando comentário à tarefa ID {}: {}", tarefaId,
                conteudo.substring(0, Math.min(50, conteudo.length())));

        // Obter usuário atual (simplificado - pegar o primeiro usuário como autor)
        // Em produção, deveria pegar do contexto de segurança
        Pessoa autor = pessoaRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum usuário encontrado"));

        // Criar e salvar o comentário real
        com.smartmeeting.model.ComentarioTarefa comentario = new com.smartmeeting.model.ComentarioTarefa();
        comentario.setTexto(conteudo);
        comentario.setTarefa(tarefa);
        comentario.setAutor(autor);
        comentario.setDataCriacao(LocalDateTime.now());

        com.smartmeeting.model.ComentarioTarefa comentarioSalvo = comentarioTarefaRepository.save(comentario);

        // Retornar como Map para compatibilidade com o controller
        Map<String, Object> resultado = Map.of(
                "id", comentarioSalvo.getId(),
                "tarefaId", tarefaId,
                "conteudo", comentarioSalvo.getTexto(),
                "mencoes", mencoes != null ? mencoes : List.of(),
                "autorId", comentarioSalvo.getAutor().getId(),
                "autorNome", comentarioSalvo.getAutor().getNome(),
                "dataCriacao", comentarioSalvo.getDataCriacao(),
                "status", "criado");

        return resultado;
    }

    /**
     * Anexa um arquivo a uma tarefa
     *
     * @param tarefaId ID da tarefa
     * @param arquivo  Arquivo a ser anexado
     * @return Map com informações do anexo
     */
    @Transactional
    public Map<String, Object> anexarArquivo(Long tarefaId, MultipartFile arquivo) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("O arquivo não pode ser vazio");
        }

        logger.info("Anexando arquivo {} à tarefa ID {}", arquivo.getOriginalFilename(), tarefaId);

        // Simular upload de arquivo (em implementação real, salvaria em storage)
        Map<String, Object> anexo = Map.of(
                "id", System.currentTimeMillis(),
                "tarefaId", tarefaId,
                "nomeArquivo", arquivo.getOriginalFilename(),
                "tamanho", arquivo.getSize(),
                "tipo", arquivo.getContentType(),
                "urlDownload", "/api/arquivos/" + System.currentTimeMillis(), // URL simulada
                "dataUpload", LocalDateTime.now(),
                "status", "anexado");

        return anexo;
    }

    /**
     * Atribui uma tarefa a um responsável
     *
     * @param tarefaId      ID da tarefa
     * @param responsavelId ID do responsável
     * @param principal     Indica se é responsável principal
     * @return TarefaDTO atualizada
     */
    @Transactional
    public TarefaDTO atribuirResponsavel(Long tarefaId, Long responsavelId, Boolean principal) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        Pessoa responsavel = pessoaRepository.findById(responsavelId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Responsável não encontrado com ID: " + responsavelId));

        tarefa.setResponsavel(responsavel);

        logger.info("Atribuindo tarefa ID {} ao responsável ID {} (principal: {})", tarefaId, responsavelId, principal);

        Tarefa atualizada = tarefaRepository.save(tarefa);
        return toDTO(atualizada);
    }

    /**
     * Atualiza o progresso de uma tarefa
     *
     * @param tarefaId  ID da tarefa
     * @param progresso Novo progresso (0-100)
     * @return TarefaDTO atualizada
     */
    @Transactional
    public TarefaDTO atualizarProgresso(Long tarefaId, Integer progresso) {
        if (progresso == null || progresso < 0 || progresso > 100) {
            throw new IllegalArgumentException("Progresso deve estar entre 0 e 100");
        }

        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        logger.info("Atualizando progresso da tarefa ID {} para {}%", tarefaId, progresso);

        // Atualizar status baseado no progresso APENAS se for 100% ou 0% para manter
        // consistência,
        // mas sem forçar status intermediários que o usuário não queira.
        // O problema relatado foi o inverso (status mudando progresso), que foi
        // resolvido no toDTO.
        // Aqui, mantemos a lógica de que se o usuário setar 100%, vira DONE.

        tarefa.setProgresso(progresso);

        if (progresso == 100) {
            tarefa.setStatusTarefa(StatusTarefa.DONE);
            tarefa.setConcluida(true);
        } else if (progresso == 0 && tarefa.getStatusTarefa() == StatusTarefa.DONE) {
            // Se estava DONE e voltou pra 0, volta pra TODO? Ou deixa o usuário decidir?
            // Vamos ser conservadores e apenas mudar se for explicitamente 100 -> DONE.
            // Se o usuário mudar o progresso manualmente, ele provavelmente quer controlar
            // isso.
            // Vou remover a automação de status -> progresso aqui também para evitar
            // efeitos colaterais indesejados,
            // exceto talvez o 100% -> DONE que é muito comum.
        }

        // Decisão: Manter apenas a atualização do progresso. O status o usuário muda se
        // quiser.
        // Exceto talvez marcar como concluída se 100%.
        if (progresso == 100) {
            tarefa.setConcluida(true);
            if (tarefa.getStatusTarefa() != StatusTarefa.DONE) {
                tarefa.setStatusTarefa(StatusTarefa.DONE);
            }
        } else if (tarefa.isConcluida() && progresso < 100) {
            tarefa.setConcluida(false);
            if (tarefa.getStatusTarefa() == StatusTarefa.DONE) {
                tarefa.setStatusTarefa(StatusTarefa.IN_PROGRESS);
            }
        }

        Tarefa atualizada = tarefaRepository.save(tarefa);
        return toDTO(atualizada);
    }

    /**
     * Duplica uma tarefa
     *
     * @param tarefaId     ID da tarefa original
     * @param modificacoes Modificações opcionais para a nova tarefa
     * @return Nova tarefa criada
     */
    @Transactional
    public TarefaDTO duplicarTarefa(Long tarefaId, Map<String, Object> modificacoes) {
        Tarefa tarefaOriginal = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        logger.info("Duplicando tarefa ID {}", tarefaId);

        // Criar nova tarefa baseada na original
        Tarefa novaTarefa = new Tarefa();
        novaTarefa.setDescricao(tarefaOriginal.getDescricao() + " (Cópia)");
        novaTarefa.setPrazo(tarefaOriginal.getPrazo());
        novaTarefa.setStatusTarefa(StatusTarefa.TODO);
        novaTarefa.setConcluida(false);
        novaTarefa.setPrioridade(tarefaOriginal.getPrioridade());
        novaTarefa.setProgresso(0);

        // Manter o mesmo responsável se especificado
        if (tarefaOriginal.getResponsavel() != null) {
            novaTarefa.setResponsavel(tarefaOriginal.getResponsavel());
        }

        // Aplicar modificações se fornecidas
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
        return toDTO(salva);
    }

    /**
     * Busca tarefas por texto
     *
     * @param termo   Termo de busca
     * @param filtros Filtros adicionais
     * @return Lista de tarefas encontradas
     */
    public List<TarefaDTO> buscarPorTexto(String termo, Map<String, Object> filtros) {
        if (termo == null || termo.trim().isEmpty()) {
            return listarTodas();
        }

        logger.info("Buscando tarefas com termo: {}", termo);

        // Busca simples por descrição (em implementação real seria mais robusta)
        List<Tarefa> tarefas = tarefaRepository.findAll().stream()
                .filter(t -> t.getDescricao() != null &&
                        t.getDescricao().toLowerCase().contains(termo.toLowerCase()))
                .collect(Collectors.toList());

        // Aplicar filtros se fornecidos
        if (filtros != null && !filtros.isEmpty()) {
            if (filtros.containsKey("status")) {
                String status = (String) filtros.get("status");
                tarefas = tarefas.stream()
                        .filter(t -> t.getStatusTarefa() != null &&
                                t.getStatusTarefa().name().equals(status))
                        .collect(Collectors.toList());
            }
            if (filtros.containsKey("responsavelId")) {
                Long responsavelId = Long.valueOf(filtros.get("responsavelId").toString());
                tarefas = tarefas.stream()
                        .filter(t -> t.getResponsavel() != null &&
                                t.getResponsavel().getId().equals(responsavelId))
                        .collect(Collectors.toList());
            }
        }

        return tarefas.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém tarefas que estão vencendo
     *
     * @param dias Número de dias para considerar como "vencendo"
     * @return Lista de tarefas vencendo
     */
    public List<TarefaDTO> getTarefasVencendo(Integer dias) {
        if (dias == null || dias < 0) {
            dias = 3; // Default de 3 dias
        }

        LocalDate dataLimite = LocalDate.now().plusDays(dias);

        logger.info("Buscando tarefas vencendo nos próximos {} dias", dias);

        List<Tarefa> tarefas = tarefaRepository.findAll().stream()
                .filter(t -> t.getPrazo() != null &&
                        !t.isConcluida() &&
                        t.getPrazo().isBefore(dataLimite) &&
                        t.getPrazo().isAfter(LocalDate.now()))
                .collect(Collectors.toList());

        return tarefas.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém tarefas do usuário atual
     *
     * @return Lista de tarefas do usuário atual
     */
    public List<TarefaDTO> getTarefasDoUsuarioAtual() {

        logger.info("Buscando tarefas do usuário atual");

        return listarTodas();
    }

    /**
     * Cria tarefas por template
     *
     * @param templateId      ID do template
     * @param responsaveisIds Lista de IDs dos responsáveis
     * @param datasVencimento Lista de datas de vencimento
     * @param reuniaoId       ID da reunião (opcional)
     * @return Lista de tarefas criadas
     */
    @Transactional
    public List<TarefaDTO> criarTarefasPorTemplate(Long templateId, List<Long> responsaveisIds,
            List<String> datasVencimento, Long reuniaoId) {
        TemplateTarefa template = templateTarefaRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado com ID: " + templateId));

        logger.info("Criando {} tarefas a partir do template ID {}", responsaveisIds.size(), templateId);

        List<TarefaDTO> tarefasCriadas = new ArrayList<>();

        for (int i = 0; i < responsaveisIds.size(); i++) {
            Long responsavelId = responsaveisIds.get(i);
            Pessoa responsavel = pessoaRepository.findById(responsavelId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Responsável não encontrado com ID: " + responsavelId));

            Tarefa tarefa = new Tarefa();
            tarefa.setDescricao(template.getTitulo());
            tarefa.setPrazo(
                    datasVencimento != null && i < datasVencimento.size() ? LocalDate.parse(datasVencimento.get(i))
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
            tarefasCriadas.add(toDTO(salva));
        }

        return tarefasCriadas;
    }

    /**
     * Marca uma notificação como lida
     *
     * @param notificacaoId ID da notificação
     */
    @Transactional
    public void marcarNotificacaoLida(Long notificacaoId) {
        NotificacaoTarefa notificacao = notificacaoTarefaRepository.findById(notificacaoId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Notificação não encontrada com ID: " + notificacaoId));

        logger.info("Marcando notificação ID {} como lida", notificacaoId);

        notificacao.setLida(true);
        notificacaoTarefaRepository.save(notificacao);
    }
}
