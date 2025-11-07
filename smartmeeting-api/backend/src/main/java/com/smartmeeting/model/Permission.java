package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Table(name = "PERMISSION")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class Permission extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_PERMISSION")
    @SequenceGenerator(name = "SQ_PERMISSION", sequenceName = "SQ_PERMISSION", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_PERMISSION")
    private Long id;

    @Column(name = "NOME_PERMISSION", nullable = false, unique = true)
    private String nome;
}
