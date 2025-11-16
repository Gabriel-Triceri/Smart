package com.smartmeeting.service;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.SalaStatisticsDTO;
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SalaService {

    private final SalaRepository repository;
    private final ReuniaoRepository reuniaoRepository;
    private final PessoaRepository pessoaRepository;

    public SalaService(SalaRepository repository, ReuniaoRepository reuniaoRepository, PessoaRepository pessoaRepository) {
        this.repository = repository;
        this.reuniaoRepository = reuniaoRepository;
        this.pessoaRepository = pessoaRepository;
    }

    /**
     * Converte uma entidade Sala para seu respectivo DTO
     * @param sala Entidade a ser convertida
     * @return DTO correspondente
     */
    public SalaDTO toDTO(Sala sala) {
        if (sala == null) return null;
        SalaDTO dto = new SalaDTO();
        dto.setId(sala.getId());
        dto.setNome(sala.getNome());
        dto.setCapacidade(sala.getCapacidade());
        dto.setLocalizacao(sala.getLocalizacao());
        dto.setStatus(sala.getStatus());
        return dto;
    }

    /**
     * Converte um DTO para a entidade Sala
     * @param dto DTO contendo os dados da sala
     * @return Entidade Sala correspondente
     */
    public Sala toEntity(SalaDTO dto) {
        if (dto == null) return null;
        Sala sala = new Sala();
        sala.setNome(dto.getNome());
        sala.setCapacidade(dto.getCapacidade());
        sala.setLocalizacao(dto.getLocalizacao());
        sala.setStatus(dto.getStatus());
        return sala;
    }

    // --- Métodos CRUD ---
    public List<SalaDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SalaDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));
    }

    public SalaDTO criar(SalaDTO dto) {
        Sala sala = toEntity(dto);
        Sala salvo = repository.save(sala);
        return toDTO(salvo);
    }

    public SalaDTO atualizar(Long id, SalaDTO dtoAtualizada) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));
        sala.setNome(dtoAtualizada.getNome());
        sala.setCapacidade(dtoAtualizada.getCapacidade());
        sala.setLocalizacao(dtoAtualizada.getLocalizacao());
        sala.setStatus(dtoAtualizada.getStatus());
        Sala atualizado = repository.save(sala);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Sala não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

    // --- Métodos de Contagem ---
    public long getTotalSalas() {
        return repository.count();
    }

    public long getSalasEmUso() {
        // Assuming StatusSala.OCUPADA is the correct enum value for "occupied" rooms
        return repository.countByStatus(SalaStatus.OCUPADA);
    }

    // --- Novo método para obter estatísticas de salas ---
    public SalaStatisticsDTO getSalaStatistics() {
        List<Sala> todasSalas = repository.findAll();

        long total = todasSalas.size();
        long disponiveis = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.LIVRE) // Corrigido para LIVRE
                .count();
        long ocupadas = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.OCUPADA)
                .count();
        long manutencao = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.MANUTENCAO) // Corrigido para MANUTENCAO
                .count();

        // Utilização média (placeholder por enquanto)
        double utilizacaoMedia = 0.0; // Lógica mais complexa necessária para cálculo real

        return new SalaStatisticsDTO(total, disponiveis, ocupadas, manutencao, utilizacaoMedia);
    }

    public void reservarSala(Long id, String inicio, String fim) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));

        String emailOrganizador = SecurityContextHolder.getContext().getAuthentication().getName();
        Pessoa organizador = pessoaRepository.findByEmail(emailOrganizador)
                .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado com o email: " + emailOrganizador));

        Reuniao reuniao = new Reuniao();
        reuniao.setSala(sala);
        reuniao.setOrganizador(organizador);
        reuniao.setDataHoraInicio(LocalDateTime.parse(inicio));
        reuniao.setDuracaoMinutos(60);
        reuniao.setPauta("Reserva de sala");
        reuniao.setStatus(StatusReuniao.AGENDADA);
        reuniao.setAta(""); // Adicionando um valor padrão para a ata

        reuniaoRepository.save(reuniao);

        sala.setStatus(SalaStatus.RESERVADA);
        repository.save(sala);
    }

    /**
     * Verifica a disponibilidade de uma sala para uma data específica
     * @param salaId ID da sala
     * @param data Data para verificação (formato: yyyy-MM-dd)
     * @return Map com informações sobre disponibilidade
     */
    public Map<String, Object> getDisponibilidadeSala(Long salaId, String data) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        // Verificar se a sala está em manutenção
        if (sala.getStatus() == SalaStatus.MANUTENCAO) {
            return Map.of(
                    "disponivel", false,
                    "motivo", "Sala em manutenção",
                    "statusAtual", sala.getStatus()
            );
        }

        // Parse da data fornecida
        LocalDate dataSolicitada = LocalDate.parse(data, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalDateTime inicioDia = dataSolicitada.atStartOfDay();
        LocalDateTime fimDia = dataSolicitada.atTime(23, 59, 59);

        // Buscar todas as reuniões da sala para o dia específico
        List<Reuniao> reunioesDoDia = reuniaoRepository.findByStatus(StatusReuniao.AGENDADA).stream()
                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                .filter(r -> {
                    LocalDateTime inicioReuniao = r.getDataHoraInicio();
                    return !inicioReuniao.toLocalDate().isBefore(dataSolicitada) &&
                            !inicioReuniao.toLocalDate().isAfter(dataSolicitada);
                })
                .collect(Collectors.toList());

        // Verificar reuniões em progresso para o dia
        List<Reuniao> reunioesEmProgresso = reuniaoRepository.findByStatus(StatusReuniao.EM_ANDAMENTO).stream()
                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                .collect(Collectors.toList());

        boolean disponivel = reunioesDoDia.isEmpty() && reunioesEmProgresso.isEmpty();

        return Map.of(
                "disponivel", disponivel,
                "sala", toDTO(sala),
                "dataSolicitada", dataSolicitada,
                "reunioesAgendadas", reunioesDoDia.size(),
                "reunioesEmProgresso", reunioesEmProgresso.size(),
                "statusAtual", sala.getStatus(),
                "horariosDisponiveis", disponivel ? "Todo o dia" : "Parcialmente ocupado",
                "detalhesReunioes", reunioesDoDia.stream()
                        .map(r -> Map.of(
                                "id", r.getId(),
                                "inicio", r.getDataHoraInicio(),
                                "fim", r.getDataHoraInicio().plusMinutes(r.getDuracaoMinutos()),
                                "pauta", r.getPauta(),
                                "organizador", r.getOrganizador() != null ? r.getOrganizador().getNome() : "N/A"
                        ))
                        .collect(Collectors.toList())
        );
    }

    /**
     * Cancela a reserva específica de uma sala
     * @param salaId ID da sala
     * @param reservaId ID da reserva a ser cancelada
     */
    public void cancelarReservaSala(Long salaId, Long reservaId) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        // Buscar a reserva específica
        Reuniao reserva = reuniaoRepository.findById(reservaId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada com ID: " + reservaId));

        // Verificar se a reserva pertence à sala
        if (reserva.getSala() == null || !reserva.getSala().getId().equals(salaId)) {
            throw new IllegalArgumentException("A reserva não pertence à sala especificada");
        }

        // Cancelar a reserva
        reserva.setStatus(StatusReuniao.CANCELADA);
        reuniaoRepository.save(reserva);

        // Verificar se ainda há outras reservas para esta sala
        List<Reuniao> outrasReservas = reuniaoRepository.findByStatus(StatusReuniao.AGENDADA).stream()
                .filter(r -> r.getSala() != null && r.getSala().getId().equals(salaId))
                .filter(r -> r.getDataHoraInicio().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        // Se não há outras reservas, liberar a sala
        if (outrasReservas.isEmpty()) {
            sala.setStatus(SalaStatus.LIVRE);
            repository.save(sala);
        }

        System.out.println("Reserva ID " + reservaId + " da sala " + sala.getNome() + " foi cancelada");
    }

    /**
     * Atualiza os recursos disponíveis em uma sala
     * @param salaId ID da sala
     * @param recursos Lista de recursos da sala
     * @return SalaDTO atualizada
     */
    public SalaDTO updateRecursos(Long salaId, List<String> recursos) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        // Em implementação real, seria necessário uma entidade separada para recursos da sala
        // Por enquanto, apenas registramos a atualização nos logs
        System.out.println("Atualizando recursos da sala " + sala.getNome());
        System.out.println("Recursos: " + recursos);

        // Aqui poderia ter lógica para atualizar recursos específicos como:
        // - Projetores
        // - Quadros brancos
        // - Microfones
        // - Internet
        // - Acessibilidade
        // etc.

        // Por enquanto, apenas retorna a sala sem alterações nos recursos
        // Em implementação futura, podría atualizar campos específicos na entidade Sala
        return toDTO(sala);
    }

    /**
     * Atualiza o status de uma sala
     * @param salaId ID da sala
     * @param status Novo status da sala (string)
     * @return SalaDTO com status atualizado
     */
    public SalaDTO atualizarStatus(Long salaId, String status) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        SalaStatus statusAnterior = sala.getStatus();

        // Converter string para enum
        SalaStatus novoStatus;
        try {
            novoStatus = SalaStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + status + ". Valores válidos: " +
                    java.util.Arrays.toString(SalaStatus.values()));
        }

        sala.setStatus(novoStatus);

        // Log da mudança de status
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("Status da sala ").append(sala.getNome())
                .append(" alterado de ").append(statusAnterior)
                .append(" para ").append(novoStatus);

        System.out.println(logMessage.toString());

        Sala salaAtualizada = repository.save(sala);
        return toDTO(salaAtualizada);
    }

    /**
     * Busca salas por texto no nome ou localização
     * @param termo Termo de busca
     * @return Lista de salas que correspondem ao termo
     */
    public List<SalaDTO> buscarPorTexto(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return listarTodas();
        }

        String termoLower = termo.toLowerCase();

        List<Sala> salas = repository.findAll().stream()
                .filter(s -> {
                    boolean nomeMatch = s.getNome() != null &&
                            s.getNome().toLowerCase().contains(termoLower);
                    boolean localizacaoMatch = s.getLocalizacao() != null &&
                            s.getLocalizacao().toLowerCase().contains(termoLower);
                    return nomeMatch || localizacaoMatch;
                })
                .collect(Collectors.toList());

        return salas.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém as categorias de salas disponíveis
     * @return Lista de categorias de salas
     */
    public List<String> getCategorias() {
        // Implementação básica de categorias baseadas nas características das salas
        List<String> categorias = List.of(
                "Reunião Executiva",
                "Sala de Conference",
                "Sala de Treinamento",
                "Auditório",
                "Sala de Projeto",
                "Sala de Vídeo Conference",
                "Sala Informal"
        );
        
        return categorias;
    }

}
