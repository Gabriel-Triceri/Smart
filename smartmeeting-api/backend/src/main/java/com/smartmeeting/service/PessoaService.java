package com.smartmeeting.service;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Role;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PessoaService {

    private final PessoaRepository repository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public PessoaService(PessoaRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Converte uma entidade Pessoa para seu respectivo DTO
     * @param pessoa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    public PessoaDTO convertToDto(Pessoa pessoa) {
        if (pessoa == null) return null;
        PessoaDTO dto = new PessoaDTO();
        dto.setId(pessoa.getId());
        dto.setNome(pessoa.getNome());
        dto.setEmail(pessoa.getEmail());
        dto.setTipoUsuario(pessoa.getTipoUsuario());
        dto.setCrachaId(pessoa.getCrachaId());
        return dto;
    }

    /**
     * Converte um DTO de criação para a entidade Pessoa
     * @param dto DTO contendo os dados para criação
     * @return Entidade Pessoa correspondente ou null se o DTO for nulo
     */
    private Pessoa toEntity(PessoaCreateDTO dto) {
        if (dto == null) return null;
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(dto.getNome());
        pessoa.setEmail(dto.getEmail());
        pessoa.setTipoUsuario(dto.getPapel());
        pessoa.setCrachaId(dto.getCrachaId());
        pessoa.setSenha(passwordEncoder.encode(dto.getSenha()));
        return pessoa;
    }

    // --- Métodos de serviço ---
    public List<PessoaDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<PessoaDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertToDto);
    }

    public PessoaDTO salvar(PessoaCreateDTO dto) {
        // Exemplo de validação de negócio que pode lançar BadRequestException
        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Já existe uma pessoa cadastrada com este e-mail.");
        }
        Pessoa pessoa = toEntity(dto);
        Pessoa salvo = repository.save(pessoa);
        return convertToDto(salvo);
    }

    public PessoaDTO atualizar(Long id, PessoaDTO dtoAtualizada) {
        return repository.findById(id)
                .map(pessoa -> {
                    // Verifica se o e-mail foi alterado e se o novo e-mail já existe para outra pessoa
                    if (!pessoa.getEmail().equals(dtoAtualizada.getEmail()) && repository.findByEmail(dtoAtualizada.getEmail()).isPresent()) {
                        throw new BadRequestException("Já existe outra pessoa cadastrada com o e-mail: " + dtoAtualizada.getEmail());
                    }
                    pessoa.setNome(dtoAtualizada.getNome());
                    pessoa.setEmail(dtoAtualizada.getEmail());
                    pessoa.setTipoUsuario(dtoAtualizada.getTipoUsuario());
                    Pessoa atualizado = repository.save(pessoa);
                    return convertToDto(atualizado);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Pessoa não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

    public List<Role> listarRoles(Long pessoaId) {
        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));
        return pessoa.getRoles() != null ? pessoa.getRoles() : java.util.List.of();
    }

    @Transactional
    public void addRoleToPessoa(Long pessoaId, Long roleId) {
        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));

        List<Role> roles = pessoa.getRoles();
        if (roles == null) {
            roles = new java.util.ArrayList<>();
        }
        boolean exists = roles.stream().anyMatch(r -> r.getId().equals(roleId));
        if (!exists) {
            roles.add(role);
            pessoa.setRoles(roles);
            repository.save(pessoa);
        }
    }

    @Transactional
    public void removeRoleFromPessoa(Long pessoaId, Long roleId) {
        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));
        // valida existência do role
        roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));

        List<Role> roles = pessoa.getRoles();
        if (roles != null && !roles.isEmpty()) {
            boolean changed = roles.removeIf(r -> r.getId().equals(roleId));
            if (changed) {
                pessoa.setRoles(roles);
                repository.save(pessoa);
            }
        }
    }
}
