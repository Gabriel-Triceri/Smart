package com.smartmeeting.service.reuniao;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável pelo ciclo de vida das reuniões (encerramento, geração de
 * ata)
 */
@Service
@RequiredArgsConstructor
public class ReuniaoLifecycleService {

    private final ReuniaoRepository reuniaoRepository;
    private final PresencaRepository presencaRepository;

    @Transactional
    public Reuniao encerrarReuniao(Long id) {
        Reuniao reuniao = reuniaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + id));

        reuniao.setStatus(StatusReuniao.FINALIZADA);

        List<Presenca> presencasValidas = presencaRepository.findByReuniaoAndValidadoPorCrachaTrue(reuniao);

        reuniao.setAta(gerarAta(reuniao, presencasValidas));

        return reuniaoRepository.save(reuniao);
    }

    public String gerarAta(Reuniao reuniao, List<Presenca> presencas) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ata da Reunião ID ").append(reuniao.getId()).append("\n\n");
        sb.append("Data/Hora Início: ").append(reuniao.getDataHoraInicio()).append("\n");
        sb.append("Duração (minutos): ").append(reuniao.getDuracaoMinutos()).append("\n\n");
        sb.append("Pauta:\n").append(reuniao.getPauta()).append("\n\n");
        sb.append("Participantes Presentes (validados por crachá):\n");

        presencas.forEach(p -> sb.append("- ").append(p.getParticipante().getNome()).append("\n"));

        return sb.toString();
    }
}
