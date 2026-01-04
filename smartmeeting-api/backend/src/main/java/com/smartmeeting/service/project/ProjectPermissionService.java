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
//import com.smartmeeting.websocket.PermissionWebSocketHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final com.smartmeeting.repository.RoleRepository roleRepository;
    // private final PermissionWebSocketHandler webSocketHandler;

    /**
     * Inicializa os templates de permissões por role (executado no startup)
     */
    @PostConstruct
    public void initializePermissionTemplates() {
        // Sempre re-sincroniza templates ao iniciar para garantir consistência com o
        // banco global
        log.info("Sincronizando templates de permissões com Roles globais...");

        // OWNER - todas as permissões (hardcoded, pois é superusuário do projeto)
        for (PermissionType perm : PermissionType.values()) {
            saveOrUpdateTemplate(ProjectRole.OWNER, perm, true);
        }

        // Outros Roles: Tenta buscar do banco global
        syncRoleFromGlobal(ProjectRole.ADMIN);
        syncRoleFromGlobal(ProjectRole.MEMBER_EDITOR);

        log.info("Templates de permissões sincronizados com sucesso!");
    }

    private void syncRoleFromGlobal(ProjectRole projectRole) {
        // 1. Tenta buscar Role global pelo nome
        Optional<com.smartmeeting.model.Role> globalRoleOpt = roleRepository.findByNome(projectRole.name());

        if (globalRoleOpt.isPresent()) {
            // Existe no banco global -> Sincroniza
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
            // Não existe no banco global -> Usa Defaults Hardcoded (Fallback)
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
        if (role == ProjectRole.ADMIN) {
            for (PermissionType perm : PermissionType.values()) {
                boolean granted = perm != PermissionType.PROJECT_DELETE &&
                        perm != PermissionType.ADMIN_SYSTEM_SETTINGS;
                saveOrUpdateTemplate(role, perm, granted);
            }
        } else if (role == ProjectRole.MEMBER_EDITOR) {
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
     * Verifica se um usuário tem uma permissão específica em um projeto
     */
    public boolean hasPermission(Long projectId, Long personId, PermissionType permissionType) {
        // Admin global tem acesso a tudo
        if (com.smartmeeting.util.SecurityUtils.isAdmin()) {
            return true;
        }
        return permissionRepository.hasPermission(projectId, personId, permissionType);
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
        // Admin global tem acesso a tudo
        if (com.smartmeeting.util.SecurityUtils.isAdmin()) {
            return true;
        }

        Long userId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (userId == null)
            return false;
        return hasPermission(projectId, userId, permissionType);
    }

    /**
     * Obtém todas as permissões de um membro
     */
    public MemberPermissionsDTO getMemberPermissions(Long projectMemberId) {
        ProjectMember member = memberRepository.findById(projectMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado: " + projectMemberId));

        List<ProjectPermission> permissions = permissionRepository.findByProjectMemberId(projectMemberId);

        // Se não houver permissões, inicializa
        if (permissions.isEmpty()) {
            initializePermissionsForMember(member);
            permissions = permissionRepository.findByProjectMemberId(projectMemberId);
        }

        return toMemberPermissionsDTO(member, permissions);
    }

    /**
     * Obtém permissões de um usuário em um projeto específico
     */
    public MemberPermissionsDTO getPermissionsByProjectAndPerson(Long projectId, Long personId) {
        ProjectMember member = memberRepository.findByProjectIdAndPersonId(projectId, personId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membro não encontrado no projeto: " + projectId + " para pessoa: " + personId));

        return getMemberPermissions(member.getId());
    }

    /**
     * Lista todas as permissões de todos os membros de um projeto
     */
    public List<MemberPermissionsDTO> getAllMemberPermissions(Long projectId) {
        List<ProjectMember> members = memberRepository.findByProjectId(projectId);

        return members.stream()
                .map(member -> getMemberPermissions(member.getId()))
                .collect(Collectors.toList());
    }

    /**
     * Atualiza permissões de um membro
     */
    @Transactional
    public MemberPermissionsDTO updateMemberPermissions(UpdatePermissionsRequest request) {
        ProjectMember member = memberRepository.findById(request.getProjectMemberId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membro não encontrado: " + request.getProjectMemberId()));

        // OWNER não pode ter permissões alteradas
        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível alterar permissões do proprietário do projeto");
        }

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

        // Notifica o usuario via WebSocket sobre a mudanca de permissoes
        // webSocketHandler.notifyPermissionsUpdated(
        // member.getPerson().getId(),
        // member.getProject().getId());

        return getMemberPermissions(member.getId());
    }

    /**
     * Atualiza role de um membro e reseta permissões para o padrão do novo role
     */
    @Transactional
    public MemberPermissionsDTO updateMemberRole(Long projectMemberId, ProjectRole newRole) {
        ProjectMember member = memberRepository.findById(projectMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado: " + projectMemberId));

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Não é possível alterar o papel do proprietário do projeto");
        }

        // Atualiza o role
        member.setRole(newRole);
        memberRepository.save(member);

        // Remove permissões antigas
        permissionRepository.deleteByProjectMemberId(projectMemberId);

        // Inicializa novas permissões baseadas no novo role
        initializePermissionsForMember(member);

        // Notifica o usuario via WebSocket sobre a mudanca de role/permissoes
        // webSocketHandler.notifyPermissionsUpdated(
        // member.getPerson().getId(),
        // member.getProject().getId());

        return getMemberPermissions(projectMemberId);
    }

    /**
     * Reseta permissões de um membro para o padrão do seu role
     */
    @Transactional
    public MemberPermissionsDTO resetToDefaultPermissions(Long projectMemberId) {
        ProjectMember member = memberRepository.findById(projectMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado: " + projectMemberId));

        // Remove permissões existentes
        permissionRepository.deleteByProjectMemberId(projectMemberId);

        // Reinicializa com base no template do role
        initializePermissionsForMember(member);

        // Notifica o usuario via WebSocket sobre o reset de permissoes
        // webSocketHandler.notifyPermissionsUpdated(
        // member.getPerson().getId(),
        // member.getProject().getId());

        return getMemberPermissions(projectMemberId);
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

    // Métodos auxiliares de conversão
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
