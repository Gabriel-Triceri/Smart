package com.smartmeeting.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true) // Re-added autoApply = true
public class PrioridadeTarefaConverter implements AttributeConverter<PrioridadeTarefa, String> {

    private static final Logger logger = LoggerFactory.getLogger(PrioridadeTarefaConverter.class);

    @Override
    public String convertToDatabaseColumn(PrioridadeTarefa prioridadeTarefa) {
        if (prioridadeTarefa == null) {
            return null;
        }
        logger.debug("Converting enum {} to database column: {}", prioridadeTarefa, prioridadeTarefa.name());
        return prioridadeTarefa.name();
    }

    @Override
    public PrioridadeTarefa convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        logger.debug("Converting database column {} to enum", dbData);
        // Handle the specific case of "MÉDIA" from the database
        if ("MÉDIA".equalsIgnoreCase(dbData)) {
            logger.debug("Mapped 'MÉDIA' to PrioridadeTarefa.MEDIA");
            return PrioridadeTarefa.MEDIA;
        }
        // Also handle "MEDIA" (without accent) explicitly if it exists in the DB
        if ("MEDIA".equalsIgnoreCase(dbData)) {
            logger.debug("Mapped 'MEDIA' to PrioridadeTarefa.MEDIA");
            return PrioridadeTarefa.MEDIA;
        }
        try {
            PrioridadeTarefa result = PrioridadeTarefa.valueOf(dbData.toUpperCase());
            logger.debug("Mapped '{}' to {}", dbData, result);
            return result;
        } catch (IllegalArgumentException e) {
            logger.error("Unknown database value for PrioridadeTarefa: {}", dbData, e);
            throw new IllegalArgumentException("Unknown database value: " + dbData, e);
        }
    }
}
