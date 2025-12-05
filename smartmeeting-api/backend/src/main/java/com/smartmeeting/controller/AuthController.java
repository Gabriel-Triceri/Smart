package com.smartmeeting.controller;

import com.smartmeeting.dto.LoginDTO;
import com.smartmeeting.dto.RegistroDTO;
import com.smartmeeting.exception.ConflictException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.security.JwtTokenProvider;
import com.smartmeeting.enums.TipoUsuario; // Importar TipoUsuario
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;


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
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        System.out.println("DEBUG: Tentativa de login para o email: " + loginDTO.getEmail()); // DEBUG PRINT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getEmail(),
                        loginDTO.getSenha()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Gerar token JWT
        String jwt = tokenProvider.generateToken(authentication);

        // Extrair roles (sem prefixo ROLE_) e permissions das authorities
        List<String> allAuthorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        List<String> roles = allAuthorities.stream()
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring("ROLE_".length()))
                .collect(Collectors.toList());
        List<String> permissions = allAuthorities.stream()
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toList());

        // Retornar token + roles + permissions
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("roles", roles);
        response.put("permissions", permissions);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para registro de novos usuários
     * @param registroDTO DTO com dados da pessoa
     * @return Mensagem de sucesso ou erro
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@Valid @RequestBody RegistroDTO registroDTO) {
        // Verificar se o email já existe
        if (pessoaRepository.existsByEmail(registroDTO.getEmail())) {
            throw new ConflictException("Email já está em uso.");
        }

        // Criar nova pessoa
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(registroDTO.getNome());
        pessoa.setEmail(registroDTO.getEmail());
        pessoa.setSenha(passwordEncoder.encode(registroDTO.getSenha()));
        pessoa.setTipoUsuario(TipoUsuario.PARTICIPANTE); // Definido como PARTICIPANTE
        pessoa.setCrachaId(registroDTO.getCrachaId());

        // Salvar pessoa
        pessoaRepository.save(pessoa);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Usuário registrado com sucesso"));
    }

    /**
     * Endpoint para renovação de token JWT
     * Usa o token atual para gerar um novo token sem requerer senha
     * @param requestBody Map contendo o token atual
     * @return Novo token JWT
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> requestBody) {
        String token = requestBody.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token é obrigatório"));
        }

        try {
            // Validar o token atual
            if (!tokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Token inválido ou expirado"));
            }

            // Extrair informações do usuário do token
            String email = tokenProvider.getUsernameFromJWT(token);

            // Buscar usuário no banco de dados
            Pessoa pessoa = pessoaRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Extrair roles e permissions do token atual (já validado)
            List<String> currentRoles = tokenProvider.getRoles(token);
            List<String> currentPermissions = tokenProvider.getPermissions(token);

            // Criar authorities a partir dos dados do token
            List<GrantedAuthority> authorities = new java.util.ArrayList<>();
            currentRoles.forEach(role -> authorities.add(() -> "ROLE_" + role));
            currentPermissions.forEach(perm -> authorities.add(() -> perm));

            // Criar Authentication sem usar o AuthenticationManager (não requer senha)
            com.smartmeeting.security.UserPrincipal userPrincipal =
                    com.smartmeeting.security.UserPrincipal.create(pessoa);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    userPrincipal.getAuthorities()
            );

            // Gerar novo token
            String newJwt = tokenProvider.generateToken(authentication);

            // Extrair roles e permissions atualizados (podem ter mudado no banco)
            List<String> allAuthorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            List<String> roles = allAuthorities.stream()
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring("ROLE_".length()))
                    .collect(Collectors.toList());
            List<String> permissions = allAuthorities.stream()
                    .filter(a -> !a.startsWith("ROLE_"))
                    .collect(Collectors.toList());

            // Retornar novo token + roles + permissions
            Map<String, Object> response = new HashMap<>();
            response.put("token", newJwt);
            response.put("roles", roles);
            response.put("permissions", permissions);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Erro ao renovar token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Não foi possível renovar o token"));
        }
    }
}
