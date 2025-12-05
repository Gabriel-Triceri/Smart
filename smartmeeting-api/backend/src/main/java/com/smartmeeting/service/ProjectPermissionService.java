package com.smartmeeting.service;

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

    /**
     * Inicializa os templates de permissões por role (executado no startup)
     */
    @PostConstruct
    public void initializePermissionTemplates() {
        if (templateRepository.count() == 0) {
            log.info("Inicializando templates de permissões...");

            // OWNER - todas as permissões
            for (PermissionType perm : PermissionType.values()) {
                templateRepository.save(new RolePermissionTemplate(ProjectRole.OWNER, perm, true));
            }

            // ADMIN - quase todas, exceto algumas administrativas
            for (PermissionType perm : PermissionType.values()) {
                boolean granted = perm != PermissionType.PROJECT_DELETE &&
                        perm != PermissionType.ADMIN_SYSTEM_SETTINGS;
                templateRepository.save(new RolePermissionTemplate(ProjectRole.ADMIN, perm, granted));
            }

            // MEMBER_EDITOR - permissões básicas de edição
            Set<PermissionType> memberPermissions = Set.of(
                    PermissionType.PROJECT_VIEW,
                    PermissionType.TASK_CREATE, PermissionType.TASK_VIEW, PermissionType.TASK_EDIT,
                    PermissionType.TASK_MOVE, PermissionType.TASK_COMMENT, PermissionType.TASK_ATTACH,
                    PermissionType.KANBAN_VIEW,
                    PermissionType.MEETING_VIEW, PermissionType.MEETING_CREATE
            );
            for (PermissionType perm : PermissionType.values()) {
                templateRepository.save(new RolePermissionTemplate(
                        ProjectRole.MEMBER_EDITOR, perm, memberPermissions.contains(perm)));
            }

            log.info("Templates de permissões inicializados com sucesso!");
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
                        RolePermissionTemplate::isDefaultGranted
                ));
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
                        ProjectPermission::isGranted
                ));
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
