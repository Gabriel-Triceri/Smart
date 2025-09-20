package com.smartmeeting.service;

import com.smartmeeting.dto.PessoaCreateDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PessoaService {

    private final PessoaRepository repository;

    public PessoaService(PessoaRepository repository) {
        this.repository = repository;
    }

    /**
     * Converte uma entidade Pessoa para seu respectivo DTO
     * @param pessoa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    private PessoaDTO toDTO(Pessoa pessoa) {
        if (pessoa == null) return null;
        PessoaDTO dto = new PessoaDTO();
        dto.setId(pessoa.getId());
        dto.setNome(pessoa.getNome());
        dto.setEmail(pessoa.getEmail());
        dto.setPapel(pessoa.getTipoUsuario());
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
        pessoa.setSenha(dto.getSenha());
        return pessoa;
    }

    // --- Métodos de serviço ---
    public List<PessoaDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<PessoaDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    public PessoaDTO salvar(PessoaCreateDTO dto) {
        Pessoa pessoa = toEntity(dto);
        Pessoa salvo = repository.save(pessoa);
        return toDTO(salvo);
    }

    public PessoaDTO atualizar(Long id, PessoaDTO dtoAtualizada) {
        return repository.findById(id)
                .map(pessoa -> {
                    pessoa.setNome(dtoAtualizada.getNome());
                    pessoa.setEmail(dtoAtualizada.getEmail());
                    pessoa.setTipoUsuario(dtoAtualizada.getPapel());
                    Pessoa atualizado = repository.save(pessoa);
                    return toDTO(atualizado);
                })
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
