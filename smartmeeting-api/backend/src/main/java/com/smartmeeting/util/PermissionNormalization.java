package com.smartmeeting.util;

import com.smartmeeting.enums.PermissionType;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Utilitário para normalização de permissões legadas.
 * Garante compatibilidade entre permissões no formato moderno (PROJECT_VIEW)
 * e legadas (VIEW_PROJECT).
 */
@Component
public class PermissionNormalization {

    // Mapeamento de permissões legadas para o formato moderno
    private static final Map<String, String> LEGACY_TO_MODERN = new HashMap<>();

    // Mapeamento reverso para validação
    private static final Map<String, String> MODERN_TO_LEGACY = new HashMap<>();

    // Cache de normalização para performance
    private final Map<String, String> normalizationCache = new HashMap<>();

    static {
        // Permissões de Projeto
        LEGACY_TO_MODERN.put("VIEW_PROJECT", "PROJECT_VIEW");
        LEGACY_TO_MODERN.put("EDIT_PROJECT", "PROJECT_EDIT");
        LEGACY_TO_MODERN.put("DELETE_PROJECT", "PROJECT_DELETE");
        LEGACY_TO_MODERN.put("MANAGE_MEMBERS", "PROJECT_MANAGE_MEMBERS");

        // Permissões de Tarefas
        LEGACY_TO_MODERN.put("CREATE_TASK", "TASK_CREATE");
        LEGACY_TO_MODERN.put("VIEW_TASK", "TASK_VIEW");
        LEGACY_TO_MODERN.put("EDIT_TASK", "TASK_EDIT");
        LEGACY_TO_MODERN.put("DELETE_TASK", "TASK_DELETE");
        LEGACY_TO_MODERN.put("MOVE_TASK", "TASK_MOVE");
        LEGACY_TO_MODERN.put("ASSIGN_TASK", "TASK_ASSIGN");
        LEGACY_TO_MODERN.put("COMMENT_TASK", "TASK_COMMENT");

        // Permissões de Kanban
        LEGACY_TO_MODERN.put("MANAGE_COLUMNS", "KANBAN_MANAGE_COLUMNS");

        // Permissões Administrativas
        LEGACY_TO_MODERN.put("ADMIN", "ADMIN_MANAGE_USERS");
        LEGACY_TO_MODERN.put("VIEW_REPORTS", "ADMIN_VIEW_REPORTS");

        // Outras permissões Pipefy legadas
        LEGACY_TO_MODERN.put("EXPORT_DATA", "ADMIN_VIEW_REPORTS");
        LEGACY_TO_MODERN.put("MANAGE_AUTOMATIONS", "ADMIN_SYSTEM_SETTINGS");
        LEGACY_TO_MODERN.put("MANAGE_INTEGRATIONS", "ADMIN_SYSTEM_SETTINGS");
        LEGACY_TO_MODERN.put("VIEW_HISTORY", "TASK_VIEW");
        LEGACY_TO_MODERN.put("MANAGE_CHECKLIST", "TASK_EDIT");
        LEGACY_TO_MODERN.put("UPLOAD_ATTACHMENTS", "TASK_ATTACH");
        LEGACY_TO_MODERN.put("DELETE_ATTACHMENTS", "TASK_ATTACH");
        LEGACY_TO_MODERN.put("MANAGE_LABELS", "TASK_EDIT");
        LEGACY_TO_MODERN.put("SET_DUE_DATES", "TASK_EDIT");
        LEGACY_TO_MODERN.put("CHANGE_PRIORITY", "TASK_EDIT");
        LEGACY_TO_MODERN.put("BULK_ACTIONS", "TASK_EDIT");

        // Build reverse mapping
        for (Map.Entry<String, String> entry : LEGACY_TO_MODERN.entrySet()) {
            MODERN_TO_LEGACY.put(entry.getValue(), entry.getKey());
        }
    }

    /**
     * Normaliza um nome de permissão para o formato moderno.
     * Se a permissão já estiver no formato moderno, retorna ela mesma.
     * Se for uma permissão legada, converte para o equivalente moderno.
     * Se não reconhecer, retorna null.
     *
     * @param permissionName Nome da permissão a ser normalizada
     * @return Nome da permissão no formato moderno ou null se não reconhecida
     */
    public String normalize(String permissionName) {
        if (permissionName == null || permissionName.isBlank()) {
            return null;
        }

        String trimmed = permissionName.trim().toUpperCase();

        // Check cache first
        if (normalizationCache.containsKey(trimmed)) {
            return normalizationCache.get(trimmed);
        }

        String result;

        // Check if it's already a modern permission
        if (isModernPermission(trimmed)) {
            result = trimmed;
        }
        // Check if it's a legacy permission
        else if (LEGACY_TO_MODERN.containsKey(trimmed)) {
            result = LEGACY_TO_MODERN.get(trimmed);
        }
        // Unknown permission
        else {
            result = null;
        }

        normalizationCache.put(trimmed, result);
        return result;
    }

    /**
     * Verifica se uma permissão é válida (existe no sistema).
     * Suporta tanto o formato moderno quanto o legada.
     *
     * @param permissionName Nome da permissão
     * @return true se a permissão for válida
     */
    public boolean isValidPermission(String permissionName) {
        String normalized = normalize(permissionName);
        return normalized != null;
    }

    /**
     * Verifica se uma permissão já está no formato moderno.
     *
     * @param permissionName Nome da permissão
     * @return true se estiver no formato moderno
     */
    public boolean isModernPermission(String permissionName) {
        if (permissionName == null || permissionName.isBlank()) {
            return false;
        }
        try {
            PermissionType.valueOf(permissionName.trim().toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Verifica se uma permissão é uma versão legada de uma permissão moderna.
     *
     * @param permissionName Nome da permissão
     * @return true se for uma permissão legada
     */
    public boolean isLegacyPermission(String permissionName) {
        if (permissionName == null || permissionName.isBlank()) {
            return false;
        }
        return LEGACY_TO_MODERN.containsKey(permissionName.trim().toUpperCase());
    }

    /**
     * Converte uma permissão moderna para o equivalente legada.
     * Útil para retrocompatibilidade com sistemas legados.
     *
     * @param modernPermission Permissão no formato moderno
     * @return Permissão equivalente no formato legada ou null se não existir
     */
    public String toLegacy(String modernPermission) {
        if (modernPermission == null || modernPermission.isBlank()) {
            return null;
        }
        return MODERN_TO_LEGACY.get(modernPermission.trim().toUpperCase());
    }

    /**
     * Verifica se duas permissões são equivalentes
     * (mesma ação, независимо do formato).
     *
     * @param permission1 Primeira permissão
     * @param permission2 Segunda permissão
     * @return true se representarem a mesma permissão
     */
    public boolean areEquivalent(String permission1, String permission2) {
        String normalized1 = normalize(permission1);
        String normalized2 = normalize(permission2);

        if (normalized1 == null || normalized2 == null) {
            return false;
        }

        return normalized1.equals(normalized2);
    }

    /**
     * Normaliza um conjunto de permissões.
     * Remove duplicatas e permissões inválidas.
     *
     * @param permissions Conjunto de nomes de permissões
     * @return Conjunto normalizado de permissões no formato moderno
     */
    public Set<String> normalizeAll(Set<String> permissions) {
        return permissions.stream()
                .map(this::normalize)
                .filter(p -> p != null)
                .collect(java.util.stream.Collectors.toSet());
    }

    /**
     * Verifica se o usuário tem uma permissão específica,
     * considerando tanto o formato moderno quanto o legada.
     *
     * @param userPermissions Permissões do usuário
     * @param requestedPermission Permissão solicitada
     * @return true se o usuário tiver a permissão
     */
    public boolean hasPermission(Set<String> userPermissions, String requestedPermission) {
        String normalizedRequested = normalize(requestedPermission);
        if (normalizedRequested == null) {
            return false;
        }

        // Check direct match
        if (userPermissions.contains(normalizedRequested)) {
            return true;
        }

        // Check legacy equivalents
        String legacyEquivalent = toLegacy(normalizedRequested);
        if (legacyEquivalent != null && userPermissions.contains(legacyEquivalent)) {
            return true;
        }

        // Check if any normalized user permission matches the requested one
        for (String userPerm : userPermissions) {
            if (areEquivalent(userPerm, normalizedRequested)) {
                return true;
            }
        }

        return false;
    }
}
