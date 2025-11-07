package com.smartmeeting.frontend.net;

import com.smartmeeting.frontend.service.SessionManager;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;

import java.io.IOException;
import java.time.Duration;

public class ApiClient {
    private static final OkHttpClient client;

    static {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BASIC);

        client = new OkHttpClient.Builder()
                .callTimeout(Duration.ofSeconds(30))
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(30))
                .writeTimeout(Duration.ofSeconds(30))
                .addInterceptor(chain -> {
                    Request original = chain.request();
                    Request.Builder builder = original.newBuilder();
                    String token = SessionManager.getInstance().getJwtToken();
                    if (token != null && !token.isEmpty()) {
                        builder.header("Authorization", "Bearer " + token);
                    }
                    return chain.proceed(builder.build());
                })
                .addInterceptor(logging)
                .build();
    }

    public static String get(String url) throws IOException {
        Request request = new Request.Builder().url(url).get().build();
        try (Response response = client.newCall(request).execute()) {
            return handleResponse(response);
        }
    }

    public static String delete(String url) throws IOException {
        Request request = new Request.Builder().url(url).delete().build();
        try (Response response = client.newCall(request).execute()) {
            return handleResponse(response);
        }
    }

    public static String postJson(String url, String jsonBody) throws IOException {
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder().url(url).post(body).build();
        try (Response response = client.newCall(request).execute()) {
            return handleResponse(response);
        }
    }

    public static String putJson(String url, String jsonBody) throws IOException {
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder().url(url).put(body).build();
        try (Response response = client.newCall(request).execute()) {
            return handleResponse(response);
        }
    }

    private static String handleResponse(Response response) throws IOException {
        if (!response.isSuccessful()) {
            String body = response.body() != null ? response.body().string() : "";
            throw new IOException("HTTP " + response.code() + " - " + response.message() + (body.isEmpty() ? "" : ("\n" + body)));
        }
        ResponseBody responseBody = response.body();
        if (responseBody == null) {
            return "";
        }
        return responseBody.string();
    }
}
