package com.smartmeeting.frontend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.frontend.service.AuthService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import com.smartmeeting.enums.TipoUsuario; // Importar o enum do backend

import java.io.IOException;
import java.util.Map;

public class RegisterController {

    @FXML
    private TextField nameField;
    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private PasswordField confirmPasswordField;
    // Removido: @FXML private ComboBox<TipoUsuario> roleComboBox;
    @FXML
    private TextField crachaIdField;
    @FXML
    private Button registerButton;
    @FXML
    private Label statusLabel;

    private AuthService authService = new AuthService();
    private ObjectMapper objectMapper = new ObjectMapper();

    @FXML
    public void initialize() {
        // Removido: roleComboBox.getItems().addAll(TipoUsuario.values());
        // Removido: roleComboBox.setValue(TipoUsuario.PARTICIPANTE);
    }

    private void showStatus(String message, boolean isError) {
        statusLabel.setText(message);
        statusLabel.setStyle(isError ? "-fx-text-fill: red;" : "-fx-text-fill: green;");
        statusLabel.setVisible(true);
        statusLabel.setManaged(true);
    }

    @FXML
    private void handleRegisterButtonAction() {
        String name = nameField.getText();
        String email = emailField.getText();
        String password = passwordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        TipoUsuario role = TipoUsuario.PARTICIPANTE; // Definido como PARTICIPANTE
        String crachaId = crachaIdField.getText();

        // Validações básicas no frontend
        if (name.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            showStatus("Todos os campos obrigatórios devem ser preenchidos.", true);
            return;
        }
        if (!password.equals(confirmPassword)) {
            showStatus("As senhas não coincidem.", true);
            return;
        }
        if (password.length() < 8) {
            showStatus("A senha deve ter no mínimo 8 caracteres.", true);
            return;
        }
        // TODO: Adicionar validação de formato de email mais robusta

        registerButton.setDisable(true);
        showStatus("Registrando...", false);

        new Thread(() -> {
            try {
                String responseBody = authService.register(name, email, password, role, crachaId);
                Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
                String message = responseMap.get("mensagem");

                Platform.runLater(() -> {
                    if (message != null && message.contains("sucesso")) {
                        showStatus(message + " Redirecionando para o login...", false);
                        // TODO: Navegar de volta para a tela de login após sucesso
                        MainApp.setRoot("LoginView");
                    } else {
                        showStatus(message != null ? message : "Falha no registro: Mensagem desconhecida.", true);
                    }
                });
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showStatus("Erro de comunicação: Verifique o backend e a URL. Detalhes: " + e.getMessage(), true);
                });
                e.printStackTrace();
            } catch (Exception e) {
                Platform.runLater(() -> {
                    showStatus("Erro inesperado: " + e.getMessage(), true);
                });
                e.printStackTrace();
            } finally {
                Platform.runLater(() -> registerButton.setDisable(false));
            }
        }).start();
    }

    @FXML
    private void handleLoginLinkAction() throws IOException {
        MainApp.setRoot("LoginView");
    }
}
