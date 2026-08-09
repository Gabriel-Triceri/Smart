package com.smartmeeting.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * {@code @EnableScheduling} é obrigatório: o Spring Boot não habilita agendamento por
 * padrão, então os quatro {@code @Scheduled} de
 * {@link com.smartmeeting.service.notification.NotificacaoAgendadaService} eram código
 * morto — lembrete de checklist, pendências, tarefas e presenças atrasadas nunca rodaram.
 *
 * As expressões cron são externalizadas em {@code app.notificacoes.*.cron}, e os testes as
 * desligam com {@code "-"}: subir o contexto de teste não deve disparar e-mail real.
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.smartmeeting")
@EntityScan(basePackages = "com.smartmeeting.model")
@EnableJpaRepositories(basePackages = "com.smartmeeting.repository")
@EnableScheduling
public class SmartmeetingApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartmeetingApiApplication.class, args);
    }
}
