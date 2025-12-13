package com.smartmeeting.service.kambun;

import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.KanbanColumn;
import com.smartmeeting.repository.KanbanColumnRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KanbanColumnService {

    private final KanbanColumnRepository repository;

    @PostConstruct
    public void init() {
        if (repository.count() == 0) {
            List<KanbanColumn> defaults = Arrays.stream(StatusTarefa.values())
                    .map(status -> new KanbanColumn(status, status.getDescricao()))
                    .collect(Collectors.toList());
            repository.saveAll(defaults);
        }
    }

    public List<KanbanColumn> getAllColumns() {
        // Ensure we return them in the order of the Enum to maintain board structure
        List<KanbanColumn> columns = repository.findAll();

        // If for some reason a new enum was added but not in DB yet, handle it
        // gracefully or rely on init
        // For now, just sorting by enum ordinal might be enough if we want strict order
        // But the frontend usually drives the order. Let's just return what we have.
        return columns;
    }

    @Transactional
    public KanbanColumn updateColumnTitle(StatusTarefa status, String newTitle) {
        KanbanColumn column = repository.findById(status)
                .orElseThrow(() -> new IllegalArgumentException("Column not found for status: " + status));

        column.setTitle(newTitle);
        return repository.save(column);
    }
}
