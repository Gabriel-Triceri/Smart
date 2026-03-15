package com.smartmeeting.controller;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.service.pessoa.PessoaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<List<PessoaDTO>> listarTodos(@RequestParam(required = false) String search) {
        List<PessoaDTO> pessoas = pessoaService.listar(search);
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS') or #id == authentication.principal.id")
    public ResponseEntity<PessoaDTO> buscarPorId(@PathVariable Long id) {
        return pessoaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<PessoaDTO> criarPessoa(@Valid @RequestBody PessoaCreateDTO dto) {
        PessoaDTO pessoaSalva = pessoaService.salvar(dto);
        return ResponseEntity.ok(pessoaSalva);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<PessoaDTO> atualizarPessoa(@PathVariable Long id, @RequestBody PessoaDTO pessoaDTO) {
        PessoaDTO pessoaAtualizada = pessoaService.atualizar(id, pessoaDTO);
        return ResponseEntity.ok(pessoaAtualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarPessoa(@PathVariable Long id) {
        pessoaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<List<String>> listarRoles(@PathVariable Long id) {
        List<String> roles = pessoaService.listarRoles(id).stream()
                .map(Role::getNome)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @PostMapping("/{id}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<Void> adicionarRole(@PathVariable Long id, @PathVariable Long roleId) {
        pessoaService.addRoleToPessoa(id, roleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_MANAGE_USERS')")
    public ResponseEntity<Void> removerRole(@PathVariable Long id, @PathVariable Long roleId) {
        pessoaService.removeRoleFromPessoa(id, roleId);
        return ResponseEntity.noContent().build();
    }
}
