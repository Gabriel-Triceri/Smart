package com.smartmeeting.controller;

import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.KanbanColumn;
import com.smartmeeting.service.KanbanColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/kanban/columns")
@RequiredArgsConstructor
public class KanbanColumnController {

    private final KanbanColumnService service;

    @GetMapping
    public ResponseEntity<List<KanbanColumn>> getAllColumns() {
        return ResponseEntity.ok(service.getAllColumns());
    }

    @PutMapping("/{status}")
    public ResponseEntity<KanbanColumn> updateColumnTitle(
            @PathVariable("status") String statusValue,
            @RequestBody Map<String, String> payload) {

        StatusTarefa status;
        try {
            status = StatusTarefa.fromValue(statusValue);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        String newTitle = payload.get("title");
        if (newTitle == null || newTitle.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(service.updateColumnTitle(status, newTitle));
    }
}
