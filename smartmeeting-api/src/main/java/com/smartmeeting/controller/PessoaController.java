package com.smartmeeting.controller;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.service.PessoaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    /**
     * Lista todas as pessoas cadastradas no sistema
     * @return ResponseEntity contendo a lista de pessoas
     */
    @GetMapping
    public ResponseEntity<List<PessoaDTO>> listarTodas() {
        List<PessoaDTO> pessoas = pessoaService.listarTodas();
        return ResponseEntity.ok(pessoas);
    }

    /**
     * Busca uma pessoa específica pelo seu ID
     * @param id Identificador da pessoa
     * @return ResponseEntity contendo a pessoa encontrada ou status 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<PessoaDTO> buscarPorId(@PathVariable Long id) {
        return pessoaService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria uma nova pessoa no sistema
     * @param dto Dados da pessoa a ser criada
     * @return ResponseEntity contendo a pessoa criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<PessoaDTO> criarPessoa(@RequestBody PessoaCreateDTO dto) {
        try {
            PessoaDTO pessoaSalva = pessoaService.salvar(dto);
            return ResponseEntity.ok(pessoaSalva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Atualiza uma pessoa existente
     * @param id Identificador da pessoa a ser atualizada
     * @param pessoaDTO Novos dados da pessoa
     * @return ResponseEntity contendo a pessoa atualizada ou status 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<PessoaDTO> atualizarPessoa(@PathVariable Long id, @RequestBody PessoaDTO pessoaDTO) {
        try {
            PessoaDTO pessoaAtualizada = pessoaService.atualizar(id, pessoaDTO);
            return ResponseEntity.ok(pessoaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove uma pessoa do sistema
     * @param id Identificador da pessoa a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPessoa(@PathVariable Long id) {
        try {
            pessoaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
