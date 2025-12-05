package com.smartmeeting.controller;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.service.PessoaService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import com.smartmeeting.model.Role;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    /**
     * Lista todas as pessoas cadastradas no sistema
     * 
     * @return ResponseEntity contendo a lista de pessoas
     */
    @GetMapping
    public ResponseEntity<List<PessoaDTO>> listarTodas(@RequestParam(required = false) String search) {
        List<PessoaDTO> pessoas = pessoaService.listar(search);
        return ResponseEntity.ok(pessoas);
    }

    /**
     * Busca uma pessoa específica pelo seu ID
     * 
     * @param id Identificador da pessoa
     * @return ResponseEntity contendo a pessoa encontrada ou status 404 se não
     *         existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<PessoaDTO> buscarPorId(@PathVariable Long id) {
        // O service lançará ResourceNotFoundException se não encontrar, que será
        // tratada pelo GlobalExceptionHandler
        return pessoaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // Mantido para o Optional vazio
    }

    /**
     * Cria uma nova pessoa no sistema
     * 
     * @param dto Dados da pessoa a ser criada
     * @return ResponseEntity contendo a pessoa criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<PessoaDTO> criarPessoa(@Valid @RequestBody PessoaCreateDTO dto) {
        PessoaDTO pessoaSalva = pessoaService.salvar(dto);
        return ResponseEntity.ok(pessoaSalva);
    }

    /**
     * Atualiza uma pessoa existente
     * 
     * @param id        Identificador da pessoa a ser atualizada
     * @param pessoaDTO Novos dados da pessoa
     * @return ResponseEntity contendo a pessoa atualizada ou status 404 se não
     *         existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<PessoaDTO> atualizarPessoa(@PathVariable Long id, @RequestBody PessoaDTO pessoaDTO) {
        PessoaDTO pessoaAtualizada = pessoaService.atualizar(id, pessoaDTO);
        return ResponseEntity.ok(pessoaAtualizada);
    }

    /**
     * Remove uma pessoa do sistema
     * 
     * @param id Identificador da pessoa a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarPessoa(@PathVariable Long id) {
        pessoaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // --- Roles de uma pessoa ---
    @GetMapping("/{id}/roles")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> listarRoles(@PathVariable Long id) {
        List<String> roles = pessoaService.listarRoles(id).stream()
                .map(Role::getNome)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @PostMapping("/{id}/roles/{roleId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adicionarRole(@PathVariable Long id, @PathVariable Long roleId) {
        pessoaService.addRoleToPessoa(id, roleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/roles/{roleId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removerRole(@PathVariable Long id, @PathVariable Long roleId) {
        pessoaService.removeRoleFromPessoa(id, roleId);
        return ResponseEntity.noContent().build();
    }
}
