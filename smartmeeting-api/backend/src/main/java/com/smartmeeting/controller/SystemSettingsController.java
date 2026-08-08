package com.smartmeeting.controller;

import com.smartmeeting.dto.SystemSettingsDTO;
import com.smartmeeting.service.SystemSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/settings")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    public SystemSettingsController(SystemSettingsService systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SystemSettingsDTO> getSettings() {
        return ResponseEntity.ok(systemSettingsService.get());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_SYSTEM_SETTINGS')")
    public ResponseEntity<SystemSettingsDTO> updateSettings(@Valid @RequestBody SystemSettingsDTO dto) {
        return ResponseEntity.ok(systemSettingsService.update(dto));
    }
}
