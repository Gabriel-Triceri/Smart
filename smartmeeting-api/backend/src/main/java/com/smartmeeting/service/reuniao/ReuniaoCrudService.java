package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.ReuniaoListDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.service.sala.SalaAvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelas operações CRUD básicas de Reunião
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReuniaoCrudService {

    private final ReuniaoRepository repository;
    private final PresencaRepository presencaRepository;
    private final TarefaRepository tarefaRepository;
    private final SalaAvailabilityService salaAvailabilityService;
    private final ConviteReuniaoNotifier conviteNotifier;

    public List<ReuniaoListDTO> listarTodas(Long userId) {
        List<Reuniao> reunioes;
        if (userId != null) {
            reunioes = repository.findAllWithDetailsByUserId(userId);
        } else {
            reunioes = repository.findAllWithDetails();
        }
        return reunioes.stream()
                .map(this::toReuniaoListDTO)
                .collect(Collectors.toList());
    }

    private ReuniaoListDTO toReuniaoListDTO(Reuniao reuniao) {
        String organizadorNome = reuniao.getOrganizador() != null ? reuniao.getOrganizador().getNome() : null;
        String projectName = reuniao.getProject() != null ? reuniao.getProject().getName() : null;
        Long projectId = reuniao.getProject() != null ? reuniao.getProject().getId() : null;
        return new ReuniaoListDTO(
                reuniao.getId(),
                reuniao.getTitulo(),
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                reuniao.getStatus(),
                organizadorNome,
                projectName,
                projectId);
    }

    public Optional<Reuniao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Reuniao buscarPorIdObrigatorio(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));
    }

    @Transactional
    public Reuniao salvar(Reuniao reuniao) {
        // STATUS_REUNIAO e ATA_REUNIAO são NOT NULL, mas nenhum dos dois é do cliente:
        // status nasce AGENDADA e a ata só existe depois do encerramento. Sem estes
        // defaults, criar reunião com um corpo normal virava 500 por constraint.
        if (reuniao.getStatus() == null) {
            reuniao.setStatus(StatusReuniao.AGENDADA);
        }
        if (reuniao.getAta() == null) {
            reuniao.setAta("");
        }

        validarSalaLivre(reuniao, null);

        Reuniao salva = repository.save(reuniao);

        // O convite sai depois do commit — ver ConviteReuniaoNotifier.
        conviteNotifier.notificarCriacao(salva);

        return salva;
    }

    @Transactional
    public Reuniao atualizar(Long id, Reuniao reuniaoAtualizada) {
        return repository.findById(id)
                .map(reuniaoExistente -> {
                    validarSalaLivre(reuniaoAtualizada, id);

                    reuniaoExistente.setTitulo(reuniaoAtualizada.getTitulo());
                    reuniaoExistente.setDataHoraInicio(reuniaoAtualizada.getDataHoraInicio());
                    reuniaoExistente.setDuracaoMinutos(reuniaoAtualizada.getDuracaoMinutos());
                    reuniaoExistente.setPauta(reuniaoAtualizada.getPauta());
                    // ATA_REUNIAO é NOT NULL: um PUT sem o campo zerava a ata gerada no
                    // encerramento e o update morria com 500 na constraint.
                    if (reuniaoAtualizada.getAta() != null) {
                        reuniaoExistente.setAta(reuniaoAtualizada.getAta());
                    }
                    // O status NÃO vem do corpo: era possível marcar FINALIZADA por PUT sem
                    // passar por encerrarReuniao(), que é quem gera a ata. Quem muda o
                    // status é o ciclo de vida (ReuniaoLifecycleService).
                    reuniaoExistente.setOrganizador(reuniaoAtualizada.getOrganizador());
                    reuniaoExistente.setSala(reuniaoAtualizada.getSala());
                    reuniaoExistente.setParticipantes(reuniaoAtualizada.getParticipantes());
                    return repository.save(reuniaoExistente);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));
    }

    /**
     * PRESENCA.REUNIAO e TAREFA.ID_REUNIAO têm FK para REUNIAO, e os {@code @OneToMany} da
     * entidade não declaram cascade nem orphanRemoval: apagar direto violava a integridade
     * referencial e devolvia 500 (mesma falha já corrigida em {@code DELETE /projects/{id}}).
     *
     * A presença só existe por causa da reunião, então vai junto. A tarefa não — ela
     * pertence também ao projeto e sobrevive apenas desvinculada.
     */
    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Reunião não encontrada com ID: " + id);
        }

        int tarefasDesvinculadas = tarefaRepository.desvincularDaReuniao(id);
        presencaRepository.deleteByReuniaoId(id);

        repository.deleteById(id);

        log.info("Reunião {} excluída; {} tarefa(s) desvinculada(s)", id, tarefasDesvinculadas);
    }

    private void validarSalaLivre(Reuniao reuniao, Long reuniaoIdIgnorada) {
        if (reuniao.getSala() == null) {
            return;
        }
        salaAvailabilityService.validarDisponibilidadeParaReuniao(
                reuniao.getSala().getId(),
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                reuniaoIdIgnorada);
    }
}
