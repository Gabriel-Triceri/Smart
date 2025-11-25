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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
     * 
     * @param pessoa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
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

    /**
     * Converte um DTO de criação para a entidade Pessoa
     * 
     * @param dto DTO contendo os dados para criação
     * @return Entidade Pessoa correspondente
     * @throws BadRequestException se o DTO for inválido
     */
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

    public List<PessoaDTO> listar(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return listarTodas();
        }
        return repository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(termo.trim(), termo.trim())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<PessoaDTO> buscarPorId(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repository.findById(id).map(this::convertToDto);
    }

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

    public void deletar(Long id) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Pessoa não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

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

    /**
     * Busca uma pessoa por ID, retornando a entidade completa
     * 
     * @param id ID da pessoa
     * @return Entidade Pessoa
     * @throws ResourceNotFoundException se não encontrar
     */
    public Pessoa buscarEntidadePorId(Long id) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));
    }

    /**
     * Busca uma pessoa por email
     * 
     * @param email Email da pessoa
     * @return Optional da pessoa
     */
    public Optional<PessoaDTO> buscarPorEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return repository.findByEmail(email.trim().toLowerCase()).map(this::convertToDto);
    }

    /**
     * Verifica se uma pessoa existe
     * 
     * @param id ID da pessoa
     * @return true se existir, false caso contrário
     */
    public boolean existePorId(Long id) {
        return id != null && repository.existsById(id);
    }

    /**
     * Conta total de pessoas cadastradas
     * 
     * @return número total de pessoas
     */
    public long contarPessoas() {
        return repository.count();
    }

    /**
     * Lista pessoas por tipo de usuário
     * 
     * @param tipoUsuario Tipo do usuário
     * @return Lista de pessoas do tipo especificado
     */
    public List<PessoaDTO> listarPorTipoUsuario(String tipoUsuario) {
        if (tipoUsuario == null) {
            throw new BadRequestException("Tipo de usuário não pode ser null");
        }

        return repository.findAll().stream()
                .filter(pessoa -> Objects.equals(pessoa.getTipoUsuario(), tipoUsuario))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza senha da pessoa
     * 
     * @param id        ID da pessoa
     * @param novaSenha Nova senha
     * @throws BadRequestException se os dados forem inválidos
     */
    @Transactional
    public void atualizarSenha(Long id, String novaSenha) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }
        if (novaSenha == null || novaSenha.trim().isEmpty()) {
            throw new BadRequestException("Nova senha não pode ser vazia");
        }

        Pessoa pessoa = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));

        pessoa.setSenha(passwordEncoder.encode(novaSenha.trim()));
        repository.save(pessoa);
    }
}