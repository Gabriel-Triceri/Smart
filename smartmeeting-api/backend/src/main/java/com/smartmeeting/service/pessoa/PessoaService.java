package com.smartmeeting.service.pessoa;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Orquestrador público que expõe a API de PessoaService.
 * Delega para serviços especializados.
 */
@Service
@RequiredArgsConstructor
public class PessoaService {

    private final PessoaCrudService crudService;
    private final PessoaRoleService roleService;
    private final PessoaSearchService searchService;
    private final PessoaAuthService authService;
    private final PessoaStatisticsService statisticsService;

    // Conversões
    public PessoaDTO convertToDto(Pessoa pessoa) {
        return crudService.convertToDto(pessoa);
    }

    // CRUD
    public List<PessoaDTO> listarTodas() {
        return crudService.listarTodas();
    }

    public Optional<PessoaDTO> buscarPorId(Long id) {
        return crudService.buscarPorId(id);
    }

    public Pessoa buscarEntidadePorId(Long id) {
        return crudService.buscarEntidadePorId(id);
    }

    public PessoaDTO salvar(PessoaCreateDTO dto) {
        return crudService.salvar(dto);
    }

    public PessoaDTO atualizar(Long id, PessoaDTO dtoAtualizada) {
        return crudService.atualizar(id, dtoAtualizada);
    }

    public void deletar(Long id) {
        crudService.deletar(id);
    }

    // Roles
    public List<Role> listarRoles(Long pessoaId) {
        return roleService.listarRoles(pessoaId);
    }

    public void addRoleToPessoa(Long pessoaId, Long roleId) {
        roleService.addRoleToPessoa(pessoaId, roleId);
    }

    public void removeRoleFromPessoa(Long pessoaId, Long roleId) {
        roleService.removeRoleFromPessoa(pessoaId, roleId);
    }

    // Search
    public List<PessoaDTO> listar(String termo) {
        return searchService.listar(termo);
    }

    public Optional<PessoaDTO> buscarPorEmail(String email) {
        return searchService.buscarPorEmail(email);
    }

    public List<PessoaDTO> listarPorTipoUsuario(String tipoUsuario) {
        return searchService.listarPorTipoUsuario(tipoUsuario);
    }

    // Auth
    public void atualizarSenha(Long id, String novaSenha) {
        authService.atualizarSenha(id, novaSenha);
    }

    // Statistics
    public long contarPessoas() {
        return statisticsService.contarPessoas();
    }

    public boolean existePorId(Long id) {
        return statisticsService.existePorId(id);
    }
}
