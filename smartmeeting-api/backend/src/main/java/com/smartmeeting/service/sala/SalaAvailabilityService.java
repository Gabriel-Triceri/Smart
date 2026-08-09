package com.smartmeeting.service.sala;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Verificação de disponibilidade de sala para uma data específica.
 */
@Service
public class SalaAvailabilityService {

        private final SalaRepository repository;
        private final ReuniaoRepository reuniaoRepository;
        private final SalaMapper mapper;

        public SalaAvailabilityService(SalaRepository repository,
                        ReuniaoRepository reuniaoRepository,
                        SalaMapper mapper) {
                this.repository = repository;
                this.reuniaoRepository = reuniaoRepository;
                this.mapper = mapper;
        }

        /**
         * Recusa duas reuniões na mesma sala em horários que se sobrepõem.
         *
         * Este serviço já sabia calcular disponibilidade, mas nada no fluxo de criação/
         * edição de reunião o consultava: dava para agendar quantas reuniões se quisesse
         * na mesma sala e no mesmo horário.
         *
         * @param reuniaoIdIgnorada id da própria reunião num update — sem isto, editar a
         *                          pauta de uma reunião conflitaria com ela mesma.
         */
        public void validarDisponibilidadeParaReuniao(Long salaId,
                        LocalDateTime inicio,
                        Integer duracaoMinutos,
                        Long reuniaoIdIgnorada) {
                if (salaId == null || inicio == null || duracaoMinutos == null || duracaoMinutos <= 0) {
                        return;
                }

                LocalDateTime fim = inicio.plusMinutes(duracaoMinutos);

                // Somente AGENDADA/EM_ANDAMENTO ocupam a sala: finalizada e cancelada não.
                List<Reuniao> ocupantes = reuniaoRepository.findBySalaIdAndStatusIn(
                                salaId,
                                List.of(com.smartmeeting.enums.StatusReuniao.AGENDADA,
                                                com.smartmeeting.enums.StatusReuniao.EM_ANDAMENTO));

                Reuniao conflito = ocupantes.stream()
                                .filter(r -> reuniaoIdIgnorada == null || !reuniaoIdIgnorada.equals(r.getId()))
                                .filter(r -> seSobrepoe(inicio, fim, r))
                                .findFirst()
                                .orElse(null);

                if (conflito != null) {
                        throw new BadRequestException(String.format(
                                        "A sala já está reservada para a reunião %d (%s) das %s às %s.",
                                        conflito.getId(),
                                        conflito.getTitulo(),
                                        conflito.getDataHoraInicio(),
                                        conflito.getDataHoraFim()));
                }
        }

        /** Intervalos semiabertos: encostar o fim de uma no início da outra não conflita. */
        private boolean seSobrepoe(LocalDateTime inicio, LocalDateTime fim, Reuniao existente) {
                if (existente.getDataHoraInicio() == null || existente.getDuracaoMinutos() == null) {
                        return false;
                }
                LocalDateTime inicioExistente = existente.getDataHoraInicio();
                LocalDateTime fimExistente = inicioExistente.plusMinutes(existente.getDuracaoMinutos());

                return inicio.isBefore(fimExistente) && inicioExistente.isBefore(fim);
        }

        public Map<String, Object> getDisponibilidadeSala(Long salaId, String data) {
                Sala sala = repository.findById(salaId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Sala não encontrada com ID: " + salaId));

                if (sala.getStatus() == com.smartmeeting.enums.SalaStatus.MANUTENCAO) {
                        return Map.of(
                                        "disponivel", false,
                                        "motivo", "Sala em manutenção",
                                        "statusAtual", sala.getStatus());
                }

                LocalDate dataSolicitada = LocalDate.parse(data, DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                List<Reuniao> reunioesDoDia = reuniaoRepository
                                .findByStatus(com.smartmeeting.enums.StatusReuniao.AGENDADA)
                                .stream()
                                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                                .filter(r -> {
                                        LocalDateTime inicioReuniao = r.getDataHoraInicio();
                                        return !inicioReuniao.toLocalDate().isBefore(dataSolicitada) &&
                                                        !inicioReuniao.toLocalDate().isAfter(dataSolicitada);
                                })
                                .collect(Collectors.toList());

                List<Reuniao> reunioesEmProgresso = reuniaoRepository
                                .findByStatus(com.smartmeeting.enums.StatusReuniao.EM_ANDAMENTO).stream()
                                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                                .collect(Collectors.toList());

                boolean disponivel = reunioesDoDia.isEmpty() && reunioesEmProgresso.isEmpty();

                return Map.of(
                                "disponivel", disponivel,
                                "sala", mapper.toDTO(sala),
                                "dataSolicitada", dataSolicitada,
                                "reunioesAgendadas", reunioesDoDia.size(),
                                "reunioesEmProgresso", reunioesEmProgresso.size(),
                                "statusAtual", sala.getStatus(),
                                "horariosDisponiveis", disponivel ? "Todo o dia" : "Parcialmente ocupado",
                                "detalhesReunioes", reunioesDoDia.stream()
                                                .map(r -> Map.of(
                                                                "id", r.getId(),
                                                                "inicio", r.getDataHoraInicio(),
                                                                "fim",
                                                                r.getDataHoraInicio()
                                                                                .plusMinutes(r.getDuracaoMinutos()),
                                                                "pauta", r.getPauta(),
                                                                "organizador",
                                                                r.getOrganizador() != null
                                                                                ? r.getOrganizador().getNome()
                                                                                : "N/A"))
                                                .collect(Collectors.toList()));
        }
}
