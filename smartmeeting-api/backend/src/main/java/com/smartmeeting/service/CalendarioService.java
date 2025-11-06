package com.smartmeeting.service;

import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.service.export.ICalExportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CalendarioService {

    private final ReuniaoRepository reuniaoRepository;

    public CalendarioService(ReuniaoRepository reuniaoRepository) {
        this.reuniaoRepository = reuniaoRepository;
    }

    public Optional<String> gerarICalParaReuniao(Long reuniaoId) {
        Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + reuniaoId));
        return Optional.of(ICalExportService.gerarEventoUnico(reuniao));
    }

    public String gerarICalParaPessoa(Long pessoaId) {
        // Assumindo que pessoaRepository.findById(pessoaId) seria chamado aqui para validar a pessoa
        // Mas como não temos o PessoaRepository injetado, vamos apenas buscar as reuniões
        List<Reuniao> reunioes = reuniaoRepository.findByParticipanteId(pessoaId);
        return ICalExportService.gerarCalendario(reunioes, "Minhas Reuniões - SmartMeeting");
    }

    public String gerarICalTodasReunioes() {
        List<Reuniao> reunioes = reuniaoRepository.findAll();
        return ICalExportService.gerarCalendario(reunioes, "Todas as Reuniões - SmartMeeting");
    }
}
