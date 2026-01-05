package com.smartmeeting.service.pessoa;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelas operações CRUD de Pessoa
 */
@Service
@RequiredArgsConstructor
public class PessoaCrudService {

    private final PessoaRepository repository;
    private final PasswordEncoder passwordEncoder;

    public PessoaDTO convertToDto(Pessoa pessoa) {
        if (pessoa == null) {
            return null;
        }

        PessoaDTO dto = new PessoaDTO();
        dto.setId(pessoa.getId());
        dto.setNome(pessoa.getNome());
        dto.setEmail(pessoa.getEmail());
        dto.setTipoUsuario(pessoa.getTipoUsuario());
        dto.setCrachaId(pessoa.getCrachaId());
        return dto;
    }

    private Pessoa toEntity(PessoaCreateDTO dto) {
        if (dto == null) {
            throw new BadRequestException("DTO não pode ser null");
        }

        if (dto.getNome() == null || dto.getNome().trim().isEmpty()) {
            throw new BadRequestException("Nome não pode ser vazio");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email não pode ser vazio");
        }
        if (dto.getSenha() == null || dto.getSenha().trim().isEmpty()) {
            throw new BadRequestException("Senha não pode ser vazia");
        }

        Pessoa pessoa = new Pessoa();
        pessoa.setNome(dto.getNome().trim());
        pessoa.setEmail(dto.getEmail().trim().toLowerCase());
        pessoa.setTipoUsuario(dto.getPapel());
        pessoa.setCrachaId(dto.getCrachaId());
        pessoa.setSenha(passwordEncoder.encode(dto.getSenha()));
        return pessoa;
    }

    public List<PessoaDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<PessoaDTO> buscarPorId(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repository.findById(id).map(this::convertToDto);
    }

    public Pessoa buscarEntidadePorId(Long id) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));
    }

    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public PessoaDTO salvar(PessoaCreateDTO dto) {
        if (dto == null) {
            throw new BadRequestException("DTO não pode ser null");
        }

        String email = dto.getEmail();
        if (email == null) {
            throw new BadRequestException("Email não pode ser null");
        }

        if (repository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Já existe uma pessoa cadastrada com este e-mail: " + email);
        }

        Pessoa pessoa = toEntity(dto);
        Pessoa salvo = repository.save(pessoa);
        return convertToDto(salvo);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public PessoaDTO atualizar(Long id, PessoaDTO dtoAtualizada) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }
        if (dtoAtualizada == null) {
            throw new BadRequestException("DTO não pode ser null");
        }

        return repository.findById(id)
                .map(pessoa -> {
                    String novoEmail = dtoAtualizada.getEmail();
                    String emailAtual = pessoa.getEmail();

                    if (novoEmail == null) {
                        throw new BadRequestException("Email não pode ser null");
                    }

                    boolean emailAlterado = !Objects.equals(emailAtual, novoEmail);
                    if (emailAlterado && repository.findByEmail(novoEmail).isPresent()) {
                        throw new BadRequestException("Já existe outra pessoa cadastrada com o e-mail: " + novoEmail);
                    }

                    pessoa.setNome(dtoAtualizada.getNome());
                    pessoa.setEmail(novoEmail);
                    pessoa.setTipoUsuario(dtoAtualizada.getTipoUsuario());
                    pessoa.setCrachaId(dtoAtualizada.getCrachaId());

                    Pessoa atualizado = repository.save(pessoa);
                    return convertToDto(atualizado);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));
    }

    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public void deletar(Long id) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Pessoa não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }
}
