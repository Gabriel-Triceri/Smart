package com.smartmeeting.frontend;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

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

    // New setRoot method that accepts a Parent
    public static void setRoot(Parent root, String fxmlName) {
        scene.setRoot(root);

        // Se for a tela principal, maximiza e torna redimensionável
        if ("MainView".equals(fxmlName)) {
            primaryStage.setMaximized(true);
            primaryStage.setResizable(true);
        } else {
            // Comentado temporariamente para depuração de layout
            // primaryStage.sizeToScene();
            // primaryStage.centerOnScreen();
            // primaryStage.setResizable(false);
        }
    }

    public static void reloadCss() {
        if (scene != null) {
            scene.getStylesheets().clear();
            String css = MainApp.class.getResource("styles.css").toExternalForm();
            scene.getStylesheets().add(css);
            System.out.println("CSS reloaded.");
        }
    }

    public static void main(String[] args) {
        launch();
    }
}
