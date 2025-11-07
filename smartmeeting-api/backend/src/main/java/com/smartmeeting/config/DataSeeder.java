package com.smartmeeting.config;

import com.smartmeeting.model.Permission;
import com.smartmeeting.model.Role;
import com.smartmeeting.repository.PermissionRepository;
import com.smartmeeting.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    @Transactional
    public CommandLineRunner seedRolesAndPermissions(PermissionRepository permissionRepository,
                                                     RoleRepository roleRepository) {
        return args -> {
            // Permissions básicas
            List<String> basePermissions = Arrays.asList(
                    "CRIAR_REUNIAO",
                    "EDITAR_REUNIAO",
                    "EXCLUIR_REUNIAO",
                    "VISUALIZAR_REUNIAO",
                    "GERENCIAR_USUARIOS",
                    "GERENCIAR_SALAS",
                    "GERENCIAR_TAREFAS"
            );

            for (String nome : basePermissions) {
                permissionRepository.findByNome(nome).orElseGet(() -> {
                    Permission p = new Permission();
                    p.setNome(nome);
                    log.info("[SEED] Criando permission: {}", nome);
                    return permissionRepository.save(p);
                });
            }

            // Helper para buscar Permissions por nome
            java.util.function.Function<List<String>, List<Permission>> findPerms = names -> {
                List<Permission> list = new ArrayList<>();
                for (String n : names) {
                    permissionRepository.findByNome(n).ifPresent(list::add);
                }
                return list;
            };

            // Roles e suas permissões
            seedRoleIfMissing(roleRepository, "ADMIN", findPerms.apply(basePermissions));
            seedRoleIfMissing(roleRepository, "ORGANIZADOR", findPerms.apply(Arrays.asList(
                    "CRIAR_REUNIAO", "EDITAR_REUNIAO", "VISUALIZAR_REUNIAO"
            )));
            seedRoleIfMissing(roleRepository, "PARTICIPANTE", findPerms.apply(Arrays.asList(
                    "VISUALIZAR_REUNIAO"
            )));
            seedRoleIfMissing(roleRepository, "CONVIDADO", findPerms.apply(Arrays.asList(
                    "VISUALIZAR_REUNIAO"
            )));
        };
    }

    private void seedRoleIfMissing(RoleRepository roleRepository, String nome, List<Permission> permissions) {
        roleRepository.findByNome(nome).orElseGet(() -> {
            Role r = new Role();
            r.setNome(nome);
            r.setPermissions(permissions);
            log.info("[SEED] Criando role: {}", nome);
            return roleRepository.save(r);
        });
    }
}
