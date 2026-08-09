package com.smartmeeting.service.project;

import com.smartmeeting.enums.PermissionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Invalidação do cache de permissões por projeto.
 *
 * O evict acontece sempre <b>depois do commit</b>. Fazê-lo dentro da transação abre uma
 * janela em que um leitor concorrente chama {@code hasPermission}, não encontra a entrada,
 * lê o valor <i>antigo</i> (ainda não commitado) e re-popula o cache com ele — deixando a
 * permissão desatualizada até o TTL expirar.
 *
 * Quando não há transação ativa, invalida na hora.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionCacheInvalidator {

    private final CacheManager cacheManager;

    /** Invalida todas as permissões de uma pessoa dentro de um projeto. */
    public void invalidate(Long projectId, Long personId) {
        if (projectId == null || personId == null) {
            return;
        }

        runAfterCommit(() -> {
            Cache cache = cacheManager.getCache(ProjectPermissionService.PERMISSIONS_CACHE);
            if (cache == null) {
                return;
            }
            for (PermissionType perm : PermissionType.values()) {
                cache.evict(buildCacheKey(projectId, personId, perm));
            }
            log.debug("Cache de permissões invalidado para pessoa {} no projeto {}", personId, projectId);
        });
    }

    /**
     * Invalida o cache inteiro. Usar apenas quando o conjunto afetado não é conhecido
     * (ex.: exclusão de um projeto com muitos membros).
     */
    public void invalidateAll() {
        runAfterCommit(() -> {
            Cache cache = cacheManager.getCache(ProjectPermissionService.PERMISSIONS_CACHE);
            if (cache != null) {
                cache.clear();
                log.info("Cache de permissões limpo integralmente");
            }
        });
    }

    static String buildCacheKey(Long projectId, Long personId, PermissionType permissionType) {
        return String.format("proj_%d_user_%d_perm_%s", projectId, personId, permissionType.name());
    }

    private void runAfterCommit(Runnable acao) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    acao.run();
                }
            });
        } else {
            acao.run();
        }
    }
}
