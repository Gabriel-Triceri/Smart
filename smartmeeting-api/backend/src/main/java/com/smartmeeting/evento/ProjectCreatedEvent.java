package com.smartmeeting.evento;

import com.smartmeeting.model.Project;
import org.springframework.context.ApplicationEvent;

public class ProjectCreatedEvent extends ApplicationEvent {
    private final Project project;

    public ProjectCreatedEvent(Object source, Project project) {
        super(source);
        this.project = project;
    }

    public Project getProject() {
        return project;
    }
}