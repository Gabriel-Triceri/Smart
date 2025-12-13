package com.smartmeeting.service.pessoa;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Role;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Serviço responsável pela gestão de roles de Pessoa
 */
@Service
@RequiredArgsConstructor
public class PessoaRoleService {

    private final PessoaRepository repository;
    private final RoleRepository roleRepository;

    public List<Role> listarRoles(Long pessoaId) {
        if (pessoaId == null) {
            throw new BadRequestException("ID da pessoa não pode ser null");
        }

        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));

        return Optional.ofNullable(pessoa.getRoles())
                .filter(list -> !list.isEmpty())
                .orElseGet(ArrayList::new);
    }

    @Transactional
    public void addRoleToPessoa(Long pessoaId, Long roleId) {
        if (pessoaId == null) {
            throw new BadRequestException("ID da pessoa não pode ser null");
        }
        if (roleId == null) {
            throw new BadRequestException("ID do role não pode ser null");
        }

        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));

        List<Role> roles = pessoa.getRoles();
        if (roles == null) {
            roles = new ArrayList<>();
        }

        boolean exists = roles.stream()
                .filter(Objects::nonNull)
                .anyMatch(r -> Objects.equals(r.getId(), roleId));

        if (!exists) {
            roles.add(role);
            pessoa.setRoles(roles);
            repository.save(pessoa);
        }
    }

    @Transactional
    public void removeRoleFromPessoa(Long pessoaId, Long roleId) {
        if (pessoaId == null) {
            throw new BadRequestException("ID da pessoa não pode ser null");
        }
        if (roleId == null) {
            throw new BadRequestException("ID do role não pode ser null");
        }

        Pessoa pessoa = repository.findById(pessoaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + pessoaId));

        roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));

        List<Role> roles = pessoa.getRoles();
        if (roles != null && !roles.isEmpty()) {
            boolean changed = roles.removeIf(r -> r != null && Objects.equals(r.getId(), roleId));
            if (changed) {
                pessoa.setRoles(roles);
                repository.save(pessoa);
            }
        }
    }
}
