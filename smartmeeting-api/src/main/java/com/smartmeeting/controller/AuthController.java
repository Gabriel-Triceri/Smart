package com.smartmeeting.controller;

import com.smartmeeting.dto.LoginDTO;
import com.smartmeeting.dto.RegistroDTO;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller responsável pela autenticação de usuários
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final PessoaRepository pessoaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager,
                          PessoaRepository pessoaRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.pessoaRepository = pessoaRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Endpoint para login de usuários
     * @param loginDTO DTO com email e senha
     * @return Token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDTO.getEmail(),
                            loginDTO.getSenha()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Gerar token JWT
            String jwt = tokenProvider.generateToken(authentication);

            // Retornar token
            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException authEx) {
            // Credenciais inválidas
            logger.warn("Falha na autenticação para o email '{}': {}", loginDTO.getEmail(), authEx.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "Credenciais inválidas"));
        } catch (Exception e) {
            // Erro interno (ex: falha ao gerar token)
            logger.error("Erro interno ao processar login para o email '{}': {}", loginDTO.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro interno ao gerar token"));
        }
    }

    /**
     * Endpoint para registro de novos usuários
     * @param registroDTO DTO com dados da pessoa
     * @return Mensagem de sucesso ou erro
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody RegistroDTO registroDTO) {
        // Verificar se o email já existe
        if (pessoaRepository.existsByEmail(registroDTO.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Email já está em uso"));
        }

        // Criar nova pessoa
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(registroDTO.getNome());
        pessoa.setEmail(registroDTO.getEmail());
        pessoa.setSenha(passwordEncoder.encode(registroDTO.getSenha()));
        pessoa.setTipoUsuario(registroDTO.getPapel());
        pessoa.setCrachaId(registroDTO.getCrachaId());

        // Salvar pessoa
        pessoaRepository.save(pessoa);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Usuário registrado com sucesso"));
    }
}
