package com.smartmeeting.service;

import com.smartmeeting.dto.SystemSettingsDTO;
import com.smartmeeting.model.SystemSettings;
import com.smartmeeting.repository.SystemSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemSettingsService {

    private final SystemSettingsRepository repository;

    public SystemSettingsService(SystemSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SystemSettingsDTO get() {
        return toDTO(getOrCreateDefault());
    }

    @Transactional
    public SystemSettingsDTO update(SystemSettingsDTO dto) {
        SystemSettings settings = getOrCreateDefault();

        settings.setNotifEmail(dto.getNotificacoes().getEmail())
                .setNotifLembrete(dto.getNotificacoes().getLembretes())
                .setMinutosAntecedencia(dto.getNotificacoes().getMinutosAntecedencia())
                .setDuracaoPadraoMinutos(dto.getReunioes().getDuracaoPadraoMinutos())
                .setLimiteParticipantes(dto.getReunioes().getLimiteParticipantes())
                .setPermitirConflito(dto.getReunioes().getPermitirConflito())
                .setNomeEmpresa(dto.getSistema().getNomeEmpresa())
                .setFusoHorario(dto.getSistema().getFusoHorario())
                .setModoManutencao(dto.getSistema().getModoManutencao());

        return toDTO(repository.save(settings));
    }

    /**
     * A configuração é uma linha única criada sob demanda na primeira leitura,
     * evitando depender de seed em data.sql.
     */
    private SystemSettings getOrCreateDefault() {
        return repository.findById(SystemSettings.SINGLETON_ID)
                .orElseGet(() -> repository.save(SystemSettings.withDefaults()));
    }

    private SystemSettingsDTO toDTO(SystemSettings s) {
        return new SystemSettingsDTO()
                .setNotificacoes(new SystemSettingsDTO.Notificacoes(
                        s.getNotifEmail(), s.getNotifLembrete(), s.getMinutosAntecedencia()))
                .setReunioes(new SystemSettingsDTO.Reunioes(
                        s.getDuracaoPadraoMinutos(), s.getLimiteParticipantes(), s.getPermitirConflito()))
                .setSistema(new SystemSettingsDTO.Sistema(
                        s.getNomeEmpresa(), s.getFusoHorario(), s.getModoManutencao()));
    }
}
