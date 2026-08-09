package com.smartmeeting.service.sala;

import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ForbiddenException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.SalaRepository;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.util.SecurityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Reserva e cancelamento de reservas.
 */
@Service
public class SalaReservationService {

    private final SalaRepository repository;
    private final ReuniaoRepository reuniaoRepository;
    private final PessoaRepository pessoaRepository;
    private final ProjectPermissionService projectPermissionService;

    public SalaReservationService(SalaRepository repository,
            ReuniaoRepository reuniaoRepository,
            PessoaRepository pessoaRepository,
            ProjectPermissionService projectPermissionService) {
        this.repository = repository;
        this.reuniaoRepository = reuniaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.projectPermissionService = projectPermissionService;
    }

    @Transactional
    public void reservarSala(Long id, String inicio, String fim) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));

        String emailOrganizador = SecurityContextHolder.getContext().getAuthentication().getName();
        Pessoa organizador = pessoaRepository.findByEmail(emailOrganizador)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organizador não encontrado com o email: " + emailOrganizador));

        Reuniao reuniao = new Reuniao();
        reuniao.setSala(sala);
        reuniao.setOrganizador(organizador);
        reuniao.setDataHoraInicio(LocalDateTime.parse(inicio));
        reuniao.setDuracaoMinutos(60);
        reuniao.setPauta("Reserva de sala");
        reuniao.setStatus(StatusReuniao.AGENDADA);
        reuniao.setAta("");

        reuniaoRepository.save(reuniao);

        sala.setStatus(com.smartmeeting.enums.SalaStatus.RESERVADA);
        repository.save(sala);
    }

    @Transactional
    public void cancelarReservaSala(Long salaId, Long reservaId) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        Reuniao reserva = reuniaoRepository.findById(reservaId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada com ID: " + reservaId));

        if (reserva.getSala() == null || !reserva.getSala().getId().equals(salaId)) {
            throw new IllegalArgumentException("A reserva não pertence à sala especificada");
        }

        exigirPermissaoParaCancelar(reserva);

        reserva.setStatus(StatusReuniao.CANCELADA);
        reuniaoRepository.save(reserva);

        boolean temOutras = reuniaoRepository.findByStatus(StatusReuniao.AGENDADA).stream()
                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                .filter(r -> r.getDataHoraInicio().isAfter(LocalDateTime.now()))
                .findAny().isPresent();

        if (!temOutras) {
            sala.setStatus(com.smartmeeting.enums.SalaStatus.LIVRE);
            repository.save(sala);
        }

    }

    /**
     * Cancelar a reserva não tinha dono: qualquer autenticado cancelava a reserva
     * de qualquer outra pessoa. Só o organizador da reserva, um admin, ou quem
     * tenha MEETING_DELETE no projeto da reunião pode cancelar.
     */
    private void exigirPermissaoParaCancelar(Reuniao reserva) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        Long usuarioAtual = SecurityUtils.getCurrentUserId();
        boolean ehOrganizador = reserva.getOrganizador() != null
                && reserva.getOrganizador().getId().equals(usuarioAtual);
        if (ehOrganizador) {
            return;
        }

        if (reserva.getProject() != null
                && projectPermissionService.hasPermission(reserva.getProject().getId(), usuarioAtual,
                        PermissionType.MEETING_DELETE)) {
            return;
        }

        throw new ForbiddenException("Você não tem permissão para cancelar esta reserva.");
    }
}
