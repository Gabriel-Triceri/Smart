package com.smartmeeting.model;

import com.smartmeeting.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "Project.comOwner",
                attributeNodes = @NamedAttributeNode("owner")
        ),
        @NamedEntityGraph(
                name = "Project.comOwnerEMembers",
                attributeNodes = {
                        @NamedAttributeNode("owner"),
                        @NamedAttributeNode("members")
                }
        )
})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    // Data real de término (quando o projeto foi efetivamente concluído)
    private LocalDate actualEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectMember> members;

    @ManyToOne
    @JoinColumn(name = "ID_OWNER", referencedColumnName = "ID_PESSOA", nullable = false)
    private Pessoa owner;

    // Dados do responsável pelo projeto no cliente (opcional)
    @Column(name = "CLIENT_CONTACT_NAME")
    private String clientContactName;

    @Column(name = "CLIENT_CONTACT_EMAIL")
    private String clientContactEmail;

    @Column(name = "CLIENT_CONTACT_PHONE")
    private String clientContactPhone;

    @Column(name = "CLIENT_CONTACT_POSITION")
    private String clientContactPosition;
}