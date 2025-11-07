package com.smartmeeting.frontend;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.stage.Modality;
import javafx.stage.Window;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.*;
import javafx.application.Platform;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;

public class MainApp extends Application {

    private static Scene scene;
    private static Stage primaryStage;

    @Override
    public void start(Stage stage) throws IOException {
        primaryStage = stage;
        FXMLLoader fxmlLoader = new FXMLLoader(MainApp.class.getResource("LoginView.fxml"));
        Parent root = fxmlLoader.load();
        scene = new Scene(root, 700, 550);

        String css = this.getClass().getResource("styles.css").toExternalForm();
        scene.getStylesheets().add(css);

        stage.setTitle("SmartMeeting");
        stage.setScene(scene);
        stage.setResizable(false);
        stage.show();

        // Atalhos globais para recarregar CSS (F5 ou Ctrl+R)
        scene.addEventFilter(KeyEvent.KEY_PRESSED, e -> {
            if (e.getCode() == KeyCode.F5 || (e.isControlDown() && e.getCode() == KeyCode.R)) {
                reloadCss();
                e.consume();
            }
        });

        // Observa alterações no arquivo styles.css durante o desenvolvimento
        startCssWatcher();
    }

    public static void setRoot(String fxml) {
        try {
            FXMLLoader fxmlLoader = new FXMLLoader(MainApp.class.getResource(fxml + ".fxml"));
            Parent root = fxmlLoader.load();
            setRoot(root, fxml); // Call the new method
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void openDialog(String fxml, String title, double width, double height, boolean modal) {
        try {
            FXMLLoader loader = new FXMLLoader(MainApp.class.getResource(fxml + ".fxml"));
            Parent root = loader.load();
            openDialogWithRoot(root, title, width, height, modal);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Novo utilitário: abre um diálogo a partir de um Parent existente
    public static void openDialogWithRoot(Parent root, String title, double width, double height, boolean modal) {
        Stage dialog = new Stage();
        dialog.setTitle(title);
        dialog.initOwner(primaryStage);
        if (modal) {
            dialog.initModality(Modality.WINDOW_MODAL);
        }
        Scene dialogScene = new Scene(root, width, height);
        // aplica o mesmo CSS da aplicação ao diálogo
        String css = MainApp.class.getResource("styles.css").toExternalForm();
        dialogScene.getStylesheets().add(css);
        dialog.setScene(dialogScene);
        dialog.setResizable(false);
        dialog.centerOnScreen();
        dialog.show();
    }

    // New setRoot method that accepts a Parent
    public static void setRoot(Parent root, String fxmlName) {
        scene.setRoot(root);

        // Fluxo de tamanho da janela conforme a tela
        if ("MainView".equals(fxmlName)) {
            primaryStage.setMaximized(true);
            primaryStage.setResizable(true);
        } else if ("CreateReuniaoView".equals(fxmlName)) {
            // Abrir criar reunião no mesmo tamanho do Login
            primaryStage.setMaximized(false);
            primaryStage.setResizable(false);
            primaryStage.setWidth(700);
            primaryStage.setHeight(550);
            primaryStage.centerOnScreen();
        } else {
            // Demais telas usam tamanho atual
            // primaryStage.sizeToScene(); // opcional
        }
    }

    public static void reloadCss() {
        // Preferir arquivo físico durante desenvolvimento
        String devCssPath = System.getProperty("user.dir")
                + "/frontend/src/main/resources/com/smartmeeting/frontend/styles.css";
        Path devPath = Paths.get(devCssPath);
        String cssUrl;
        if (Files.exists(devPath)) {
            cssUrl = devPath.toUri().toString();
        } else {
            cssUrl = MainApp.class.getResource("styles.css").toExternalForm();
        }

        // Atualiza todas as janelas (janela principal e diálogos já abertos)
        for (Window window : Window.getWindows()) {
            if (window != null && window.getScene() != null) {
                window.getScene().getStylesheets().clear();
                window.getScene().getStylesheets().add(cssUrl);
            }
        }
        System.out.println("CSS reloaded from: " + cssUrl);
    }

    private void startCssWatcher() {
        new Thread(() -> {
            try {
                // 1) Tenta observar o arquivo de desenvolvimento (src/.../styles.css)
                Path devCss = Paths.get(System.getProperty("user.dir"),
                        "frontend", "src", "main", "resources", "com", "smartmeeting", "frontend", "styles.css");
                Path cssPath;
                if (Files.exists(devCss)) {
                    cssPath = devCss;
                } else {
                    // 2) Fallback: observar o recurso resolvido como arquivo (target/classes)
                    var url = MainApp.class.getResource("styles.css");
                    if (url == null) return;
                    if (!"file".equalsIgnoreCase(url.getProtocol())) return; // evita quando empacotado
                    cssPath = Paths.get(url.toURI());
                }
                Path dir = cssPath.getParent();

                WatchService watchService = FileSystems.getDefault().newWatchService();
                dir.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);

                while (true) {
                    WatchKey key = watchService.take();
                    for (WatchEvent<?> event : key.pollEvents()) {
                        if (event.kind() == StandardWatchEventKinds.ENTRY_MODIFY) {
                            Path changed = (Path) event.context();
                            if (changed != null && changed.getFileName().toString().equals(cssPath.getFileName().toString())) {
                                Platform.runLater(MainApp::reloadCss);
                            }
                        }
                    }
                    boolean valid = key.reset();
                    if (!valid) break;
                }
            } catch (InterruptedException | URISyntaxException | IOException ignored) {
            }
        }, "css-watcher").start();
    }

    public static void main(String[] args) {
        launch();
    }
}
