package com.smartmeeting.frontend.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class AppConfig {
    private static final Properties props = new Properties();

    static {
        try (InputStream in = AppConfig.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (in != null) {
                props.load(in);
            }
        } catch (IOException ignored) { }
    }

    public static String getApiBaseUrl() {
        return props.getProperty("api.baseUrl", "http://localhost:8080");
    }
}
