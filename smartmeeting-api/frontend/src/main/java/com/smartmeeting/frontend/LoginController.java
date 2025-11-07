package com.smartmeeting.frontend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.frontend.service.AuthService;
import com.smartmeeting.frontend.service.SessionManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.control.CheckBox;

import java.io.IOException;
import java.util.Map;

public class LoginController {

    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private TextField passwordVisibleField;
    @FXML
    private CheckBox showPasswordCheck;
    @FXML
    private Button loginButton;
    @FXML
    private Label statusLabel;

    private AuthService authService = new AuthService();
    private ObjectMapper objectMapper = new ObjectMapper();

    private void showStatus(String message) {
        statusLabel.setText(message);
        statusLabel.setVisible(true);
        statusLabel.setManaged(true);
    }

    @FXML
    public void initialize() {
        // Sincroniza o texto entre os dois campos de senha
        passwordVisibleField.textProperty().bindBidirectional(passwordField.textProperty());

        // Listener para alternar visibilidade entre os campos
        showPasswordCheck.selectedProperty().addListener((obs, oldV, show) -> {
            passwordVisibleField.setVisible(show);
            passwordVisibleField.setManaged(show);

            passwordField.setVisible(!show);
            passwordField.setManaged(!show);
        });
    }

    @FXML
    private void handleLoginButtonAction() {
        String email = emailField.getText();
        String password = (showPasswordCheck != null && showPasswordCheck.isSelected())
                ? passwordVisibleField.getText()
                : passwordField.getText();

        if (email.isEmpty() || password.isEmpty()) {
            showStatus("Email e senha não podem ser vazios.");
            return;
        }

        loginButton.setDisable(true);
        showStatus("Autenticando...");

        new Thread(() -> {
            try {
                String responseBody = authService.login(email, password);
                Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
                String token = responseMap.get("token");

                if (token != null && !token.isEmpty()) {
                    SessionManager.getInstance().setJwtToken(token);
                    Platform.runLater(() -> {
                        showStatus("Login bem-sucedido!");
                        MainApp.setRoot("MainView"); // Navega para a tela principal
                    });
                } else {
                    Platform.runLater(() -> {
                        showStatus("Falha no login: Token não recebido.");
                    });
                }
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showStatus("Erro de comunicação: Verifique o backend e a URL.");
                });
                e.printStackTrace();
            } catch (Exception e) {
                Platform.runLater(() -> {
                    showStatus("Erro inesperado: " + e.getMessage());
                });
                e.printStackTrace();
            } finally {
                Platform.runLater(() -> loginButton.setDisable(false));
            }
        }).start();
    }

    // Método para navegar para a tela de registro
    @FXML
    private void handleRegisterLinkAction() {
        MainApp.setRoot("RegisterView");
    }
}
