package com.smartmeeting.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.smartmeeting.service.project.ProjectPermissionService;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
@Profile("!test")
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.registerCustomCache("statistics",
                Caffeine.newBuilder()
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .build());
        cacheManager.registerCustomCache("users",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .build());
        cacheManager.registerCustomCache("salas",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .build());
        cacheManager.registerCustomCache("permissions",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .build());
        cacheManager.registerCustomCache("equipamentos",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .build());

        // Permissões por projeto. O nome vem da constante do próprio serviço: antes
        // este cache era registrado como "permissions" enquanto o serviço pedia
        // "projectPermissions", e o CaffeineCacheManager criava o cache que faltava
        // com o builder padrão — sem expiração e sem limite. Qualquer invalidação
        // esquecida virava vazamento de autorização permanente.
        //
        // O TTL curto é uma rede de segurança deliberada: limita o estrago de uma
        // invalidação faltante a minutos, em vez de "até reiniciar o processo".
        cacheManager.registerCustomCache(ProjectPermissionService.PERMISSIONS_CACHE,
                Caffeine.newBuilder()
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .maximumSize(50_000)
                        .build());

        return cacheManager;
    }
}
