package com.smartmeeting.service.project;

import com.smartmeeting.dto.MemberPermissionsDTO;
import com.smartmeeting.dto.ProjectPermissionDTO;
import com.smartmeeting.dto.UpdatePermissionsRequest;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ForbiddenException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.ProjectPermission;
import com.smartmeeting.model.RolePermissionTemplate;
import com.smartmeeting.repository.ProjectMemberRepository;
import com.smartmeeting.repository.ProjectPermissionRepository;
import com.smartmeeting.repository.RolePermissionTemplateRepository;
import com.smartmeeting.repository.RoleRepository;
//import com.smartmeeting.websocket.PermissionWebSocketHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectPermissionService {

    private final ProjectPermissionRepository permissionRepository;
    private final ProjectMemberRepository memberRepository;
    private final RolePermissionTemplateRepository templateRepository;
    private final RoleRepository roleRepository;
    private final CacheManager cacheManager;
    private final PermissionCacheInvalidator cacheInvalidator;
    // private final PermissionWebSocketHandler webSocketHandler;

    /** Nome do cache. Público para que o {@code CacheConfig} registre exatamente este. */
    public static final String PERMISSIONS_CACHE = "projectPermissions";

    /**
     * Inicializa os templates de permissões por role (executado no startup)
     */
    @PostConstruct
    public void initializePermissionTemplates() {
        log.info("Sincronizando templates de permissões com Roles globais...");

        for (PermissionType perm : PermissionType.values()) {
            saveOrUpdateTemplate(ProjectRole.OWNER, perm, true);
        }

        syncRoleFromGlobal(ProjectRole.ADMIN);
        syncRoleFromGlobal(ProjectRole.MEMBER_EDITOR);

        log.info("Templates de permissões sincronizados com sucesso!");
    }

    private void syncRoleFromGlobal(ProjectRole projectRole) {
        Optional<com.smartmeeting.model.Role> globalRoleOpt = roleRepository.findByNome(projectRole.name());

        if (globalRoleOpt.isPresent()) {
            com.smartmeeting.model.Role globalRole = globalRoleOpt.get();
            Set<String> grantedPermissions = globalRole.getPermissions().stream()
                    .map(com.smartmeeting.model.Permission::getNome)
                    .collect(Collectors.toSet());

            for (PermissionType perm : PermissionType.values()) {
                boolean granted = grantedPermissions.contains(perm.name());
                saveOrUpdateTemplate(projectRole, perm, granted);
            }
            log.info("Role {} sincronizado do banco global. Permissões ativas: {}", projectRole,
                    grantedPermissions.size());

        } else {
            log.warn("Role global {} não encontrado. Usando defaults hardcoded.", projectRole);
            applyHardcodedDefaults(projectRole);
        }
    }

    private void saveOrUpdateTemplate(ProjectRole role, PermissionType type, boolean granted) {
        RolePermissionTemplate template = templateRepository.findByProjectRoleAndPermissionType(role, type)
                .orElse(new RolePermissionTemplate(role, type, granted));
        template.setDefaultGranted(granted);
        templateRepository.save(template);
    }

    private void applyHardcodedDefaults(ProjectRole role) {
        switch (role) {
            case OWNER -> {
                // Dono do projeto: tudo dentro do projeto, inclusive excluí-lo.
                // ADMIN_SYSTEM_SETTINGS fica de fora por ser permissão do sistema,
                // não do projeto.
                for (PermissionType perm : PermissionType.values()) {
                    saveOrUpdateTemplate(role, perm, perm != PermissionType.ADMIN_SYSTEM_SETTINGS);
                }
            }
            case ADMIN -> {
                for (PermissionType perm : PermissionType.values()) {
                    boolean granted = perm != PermissionType.PROJECT_DELETE &&
                            perm != PermissionType.ADMIN_SYSTEM_SETTINGS;
                    saveOrUpdateTemplate(role, perm, granted);
                }
            }
            case MEMBER_EDITOR -> {
                Set<PermissionType> memberPermissions = Set.of(
                        PermissionType.PROJECT_VIEW,
                        PermissionType.TASK_CREATE, PermissionType.TASK_VIEW, PermissionType.TASK_EDIT,
                        PermissionType.TASK_MOVE, PermissionType.TASK_COMMENT, PermissionType.TASK_ATTACH,
                        PermissionType.KANBAN_VIEW,
                        PermissionType.MEETING_VIEW, PermissionType.MEETING_CREATE);
                for (PermissionType perm : PermissionType.values()) {
                    saveOrUpdateTemplate(role, perm, memberPermissions.contains(perm));
                }
            }
            // Sem default silencioso: um ProjectRole novo sem defaults ficaria sem
            // permissão nenhuma e o problema só apareceria em produção.
        }
    }

    /**
     * Inicializa permissões para um novo membro baseado em seu role
     */
    @Transactional
    public void initializePermissionsForMember(ProjectMember member) {
        List<RolePermissionTemplate> templates = templateRepository
                .findByProjectRole(member.getRole());

        for (RolePermissionTemplate template : templates) {
            ProjectPermission permission = new ProjectPermission(
                    member, template.getPermissionType(), template.isDefaultGranted());
            permissionRepository.save(permission);
        }
        log.info("Permissões inicializadas para membro {} no projeto {}",
                member.getPerson().getNome(), member.getProject().getName());
    }

    /**
     * Verifica se um usuário tem uma permissão específica em um projeto.
     * Usa cache para melhorar performance.
     */
    public boolean hasPermission(Long projectId, Long personId, PermissionType permissionType) {
        String cacheKey = buildCacheKey(projectId, personId, permissionType);

        Cache cache = getCache();
        if (cache != null) {
            Boolean cached = cache.get(cacheKey, Boolean.class);
            if (cached != null) {
                return cached;
            }
        }

        boolean hasPermission = permissionRepository.hasPermission(projectId, personId, permissionType);

        if (cache != null) {
            cache.put(cacheKey, hasPermission);
        }

        return hasPermission;
    }

    /**
     * Verifica permissão e lança exceção se não tiver
     */
    public void checkPermission(Long projectId, Long personId, PermissionType permissionType) {
        if (!hasPermission(projectId, personId, permissionType)) {
            throw new ForbiddenException("Você não tem permissão para: " + permissionType.getDescricao());
        }
    }

    /**
     * Verifica se o usuário atual tem permissão (para uso em @PreAuthorize)
     */
    public boolean hasPermissionForCurrentUser(Long projectId, PermissionType permissionType) {
        Long userId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (userId == null)
            return false;
        return hasPermission(projectId, userId, permissionType);
    }

    /**
     * Invalida o cache de permissões para um usuário específico em um projeto.
     * A invalidação é aplicada depois do commit — ver {@link PermissionCacheInvalidator}.
     */
    public void invalidateUserCache(Long projectId, Long personId) {
        cacheInvalidator.invalidate(projectId, personId);
    }

    private String buildCacheKey(Long projectId, Long personId, PermissionType permissionType) {
        return PermissionCacheInvalidator.buildCacheKey(projectId, personId, permissionType);
    }

    private Cache getCache() {
        if (cacheManager != null) {
            return cacheManager.getCache(PERMISSIONS_CACHE);
        }
        return null;
    }

    /**
     * Carrega um membro garantindo que ele pertence ao projeto informado.
     *
     * As rotas validam a permissão sobre o {@code projectId} do path, mas resolviam o
     * membro só pelo {@code memberId} — então quem administrava um projeto conseguia ler
     * e alterar permissões de membros de <b>outros</b> projetos. A resposta é 404 e não
     * 403 de propósito: confirmar que o membro existe noutro projeto já é vazamento.
     */
    private ProjectMember findMemberInProject(Long projectMemberId, Long projectId) {
        ProjectMember member = memberRepository.findById(projectMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado: " + projectMemberId));

        if (projectId != null
                && (member.getProject() == null || !projectId.equals(member.getProject().getId()))) {
            throw new ResourceNotFoundException(
                    "Membro " + projectMemberId + " não encontrado no projeto " + projectId);
        }

        return member;
    }

    /**
     * Obtém todas as permissões de um membro, validando que ele é do projeto informado.
     */
    @Transactional // pode realizar escrita (inicialização preguiçosa)
    public MemberPermissionsDTO getMemberPermissions(Long projectMemberId, Long projectId) {
        return carregarPermissoes(findMemberInProject(projectMemberId, projectId));
    }

    private MemberPermissionsDTO carregarPermissoes(ProjectMember member) {
        List<ProjectPermission> permissions = permissionRepository.findByProjectMemberId(member.getId());

        // Se o banco estiver vazio para este membro, inicializamos agora (Lazy Initialization)
        if (permissions.isEmpty()) {
            initializePermissionsForMember(member);
            permissions = permissionRepository.findByProjectMemberId(member.getId());
        }

        return toMemberPermissionsDTO(member, permissions);
    }

    /**
     * Obtém permissões de um usuário em um projeto específico
     */
    @Transactional
    public MemberPermissionsDTO getPermissionsByProjectAndPerson(Long projectId, Long personId) {
        ProjectMember member = memberRepository.findByProjectIdAndPersonId(projectId, personId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membro não encontrado no projeto: " + projectId + " para pessoa: " + personId));

        return carregarPermissoes(member);
    }

    /**
     * Lista todas as permissões de todos os membros de um projeto
     */
    @Transactional
    public List<MemberPermissionsDTO> getAllMemberPermissions(Long projectId) {
        // Os membros já vêm do projeto, então não precisam da validação de posse.
        return memberRepository.findByProjectId(projectId).stream()
                .map(this::carregarPermissoes)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza permissões de um membro com invalidação de cache otimizada.
     */
    @Transactional
    public MemberPermissionsDTO updateMemberPermissions(UpdatePermissionsRequest request, Long projectId) {
        ProjectMember member = findMemberInProject(request.getProjectMemberId(), projectId);

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível alterar permissões do proprietário do projeto");
        }

        Long affectedPersonId = member.getPerson().getId();
        Long projectIdDoMembro = member.getProject().getId();

        for (Map.Entry<PermissionType, Boolean> entry : request.getPermissions().entrySet()) {
            PermissionType permType = entry.getKey();
            Boolean granted = entry.getValue();

            ProjectPermission permission = permissionRepository
                    .findByProjectMemberIdAndPermissionType(member.getId(), permType)
                    .orElseGet(() -> {
                        ProjectPermission newPerm = new ProjectPermission(member, permType, granted);
                        return permissionRepository.save(newPerm);
                    });

            permission.setGranted(granted);
            permissionRepository.save(permission);
        }

        log.info("Permissões atualizadas para membro {} no projeto {}",
                member.getPerson().getNome(), member.getProject().getName());

        invalidateUserCache(projectIdDoMembro, affectedPersonId);

        return carregarPermissoes(member);
    }

    /**
     * Atualiza role de um membro e reseta permissões para o padrão do novo role
     */
    @Transactional
    public MemberPermissionsDTO updateMemberRole(Long projectMemberId, ProjectRole newRole, Long projectId) {
        ProjectMember member = findMemberInProject(projectMemberId, projectId);

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível alterar o papel do proprietário do projeto");
        }

        // O papel de dono é atribuído na criação do projeto e nunca por esta rota. Sem
        // esta guarda, um membro com PROJECT_MANAGE_MEMBERS apontava o próprio memberId,
        // virava OWNER, herdava PROJECT_DELETE e a linha ficava imutável pela guarda acima.
        if (newRole == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível promover um membro a proprietário do projeto");
        }

        Long affectedPersonId = member.getPerson().getId();
        Long projectIdDoMembro = member.getProject().getId();

        // Impede alterar o próprio papel, mesmo tendo permissão de gerenciar membros.
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(affectedPersonId)) {
            throw new BadRequestException("Não é possível alterar o próprio papel no projeto");
        }

        member.setRole(newRole);
        memberRepository.save(member);

        permissionRepository.deleteByProjectMemberId(projectMemberId);
        initializePermissionsForMember(member);

        invalidateUserCache(projectIdDoMembro, affectedPersonId);

        return carregarPermissoes(member);
    }

    /**
     * Reseta permissões de um membro para o padrão do seu role
     */
    @Transactional
    public MemberPermissionsDTO resetToDefaultPermissions(Long projectMemberId, Long projectId) {
        ProjectMember member = findMemberInProject(projectMemberId, projectId);

        // Mesma invariante dos métodos irmãos: o dono não é alterado por esta rota.
        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível redefinir as permissões do proprietário do projeto");
        }

        Long affectedPersonId = member.getPerson().getId();
        Long projectIdDoMembro = member.getProject().getId();

        permissionRepository.deleteByProjectMemberId(projectMemberId);
        initializePermissionsForMember(member);

        invalidateUserCache(projectIdDoMembro, affectedPersonId);

        return carregarPermissoes(member);
    }

    /**
     * Lista todos os tipos de permissões disponíveis
     */
    public List<ProjectPermissionDTO> getAllPermissionTypes() {
        return Arrays.stream(PermissionType.values())
                .map(p -> {
                    ProjectPermissionDTO dto = new ProjectPermissionDTO();
                    dto.setPermissionType(p);
                    dto.setPermissionDescription(p.getDescricao());
                    dto.setGranted(false);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtém template de permissões para um role
     */
    public Map<PermissionType, Boolean> getRolePermissionTemplate(ProjectRole role) {
        List<RolePermissionTemplate> templates = templateRepository.findByProjectRole(role);
        return templates.stream()
                .collect(Collectors.toMap(
                        RolePermissionTemplate::getPermissionType,
                        RolePermissionTemplate::isDefaultGranted));
    }

    private MemberPermissionsDTO toMemberPermissionsDTO(ProjectMember member, List<ProjectPermission> permissions) {
        MemberPermissionsDTO dto = new MemberPermissionsDTO();
        dto.setProjectMemberId(member.getId());
        dto.setPersonId(member.getPerson().getId());
        dto.setPersonName(member.getPerson().getNome());
        dto.setPersonEmail(member.getPerson().getEmail());
        dto.setProjectId(member.getProject().getId());
        dto.setProjectName(member.getProject().getName());
        dto.setRole(member.getRole());

        List<ProjectPermissionDTO> permissionDTOs = permissions.stream()
                .map(this::toProjectPermissionDTO)
                .collect(Collectors.toList());
        dto.setPermissions(permissionDTOs);

        Map<String, Boolean> permissionMap = permissions.stream()
                .collect(Collectors.toMap(
                        p -> p.getPermissionType().name(),
                        ProjectPermission::isGranted));
        dto.setPermissionMap(permissionMap);

        return dto;
    }

    private ProjectPermissionDTO toProjectPermissionDTO(ProjectPermission permission) {
        ProjectPermissionDTO dto = new ProjectPermissionDTO();
        dto.setId(permission.getId());
        dto.setProjectMemberId(permission.getProjectMember().getId());
        dto.setPermissionType(permission.getPermissionType());
        dto.setPermissionDescription(permission.getPermissionType().getDescricao());
        dto.setGranted(permission.isGranted());
        return dto;
    }
}
