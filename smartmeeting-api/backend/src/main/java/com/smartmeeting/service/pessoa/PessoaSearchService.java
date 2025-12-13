package com.smartmeeting.service.pessoa;

import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço responsável por buscas e filtros de Pessoa
 */
@Service
@RequiredArgsConstructor
public class PessoaSearchService {

    private final PessoaRepository repository;
    private final PessoaCrudService crudService;

    public List<PessoaDTO> listar(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return crudService.listarTodas();
        }
        return repository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(termo.trim(), termo.trim())
                .stream()
                .map(crudService::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<PessoaDTO> buscarPorEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return repository.findByEmail(email.trim().toLowerCase()).map(crudService::convertToDto);
    }

    public List<PessoaDTO> listarPorTipoUsuario(String tipoUsuario) {
        if (tipoUsuario == null) {
            throw new BadRequestException("Tipo de usuário não pode ser null");
        }

        return repository.findAll().stream()
                .filter(pessoa -> Objects.equals(pessoa.getTipoUsuario(), tipoUsuario))
                .map(crudService::convertToDto)
                .collect(Collectors.toList());
    }
}
