package com.smartmeeting.model;

import com.smartmeeting.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = {
                @UniqueConstraint(columnNames = { "ID_PROJECT", "ID_PERSON" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "project", "person" })
@EqualsAndHashCode(exclude = { "project", "person" })
@NamedEntityGraph(name = "ProjectMember.comProjectEPessoa", attributeNodes = {
                @NamedAttributeNode("project"),
                @NamedAttributeNode("person")
})
public class ProjectMember {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "ID_PROJECT", referencedColumnName = "id", nullable = false)
        private Project project;

        @ManyToOne
        @JoinColumn(name = "ID_PERSON", referencedColumnName = "ID_PESSOA", nullable = false)
        private Pessoa person;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private ProjectRole role;

        @Column(nullable = false)
        private LocalDateTime joinedAt;
}