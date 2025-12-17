package com.smartmeeting.dto;

public class KanbanColumnConfig {
    private String status;
    private String title;

    public KanbanColumnConfig(String status, String title) {
        this.status = status;
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}