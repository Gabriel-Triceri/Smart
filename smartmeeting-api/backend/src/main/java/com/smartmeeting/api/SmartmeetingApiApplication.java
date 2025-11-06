package com.smartmeeting.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.smartmeeting")
@EnableJpaRepositories(basePackages = "com.smartmeeting.repository")
@EntityScan(basePackages = "com.smartmeeting.model")
@EnableScheduling
public class SmartmeetingApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartmeetingApiApplication.class, args);
    }
}