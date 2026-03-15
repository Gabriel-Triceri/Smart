package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Mapeamento de campos entre o card de origem e o card de destino.
 *
 * Exemplo: sourceField="titulo"  → targetField="titulo"
 *          sourceField="descricao" → targetField="descricao"
 *          sourceField="prioridade" → targetField="prioridade"
 *
 * Campos suportados: titulo, descricao, prioridade, prazo, responsavel, tags, cor
 */
@Entity
@Table(name = "FLOW_CONNECTION_FIELD_MAP")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowConnectionFieldMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_FLOW_CONNECTION", nullable = false)
    private FlowConnection flowConnection;

    /** Nome do campo no card de ORIGEM */
    @Column(name = "SOURCE_FIELD", nullable = false, length = 50)
    private String sourceField;

    /** Nome do campo no card de DESTINO */
    @Column(name = "TARGET_FIELD", nullable = false, length = 50)
    private String targetField;
}