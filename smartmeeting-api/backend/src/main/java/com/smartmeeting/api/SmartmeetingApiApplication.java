package com.smartmeeting.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.smartmeeting")
@EntityScan(basePackages = "com.smartmeeting.model")
@EnableJpaRepositories(basePackages = "com.smartmeeting.repository")
public class SmartmeetingApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartmeetingApiApplication.class, args);
    }
}
