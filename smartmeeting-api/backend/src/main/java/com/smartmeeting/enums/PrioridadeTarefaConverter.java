package com.smartmeeting.enums;

import com.smartmeeting.exception.BadRequestException;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
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
        try {
            return PrioridadeTarefa.fromValue(dbData);
        } catch (BadRequestException e) {
            logger.error("Unknown database value for PrioridadeTarefa: {}", dbData);
            throw new IllegalArgumentException("Unknown database value: " + dbData, e);
        }
    }
}
