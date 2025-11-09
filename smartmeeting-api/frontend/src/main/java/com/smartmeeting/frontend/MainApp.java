package com.smartmeeting.frontend;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Modality;
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

        // Aplica o CSS inicial a partir do classpath
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
            setRoot(root, fxml);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void setRoot(Parent root, String fxmlName) {
        scene.setRoot(root);


        if ("MainView".equals(fxmlName)) {
            primaryStage.setMaximized(true);
            primaryStage.setResizable(true);
        } else if ("CreateReuniaoView".equals(fxmlName)) {
            primaryStage.setMaximized(false);
            primaryStage.setResizable(false);
            primaryStage.setWidth(700);
            primaryStage.setHeight(550);
            primaryStage.centerOnScreen();
        } else {
            primaryStage.setResizable(false);
            primaryStage.centerOnScreen();
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

    public static void openDialogWithRoot(Parent root, String title, double width, double height, boolean modal) {
        Stage dialog = new Stage();
        dialog.setTitle(title);
        dialog.initOwner(primaryStage);
        if (modal) {
            dialog.initModality(Modality.WINDOW_MODAL);
        }

        Scene dialogScene = new Scene(root, width, height);
        String css = MainApp.class.getResource("styles.css").toExternalForm();
        dialogScene.getStylesheets().add(css);

        dialog.setScene(dialogScene);
        dialog.setResizable(false);
        dialog.centerOnScreen();
        dialog.show();
    }

    public static void main(String[] args) {
        launch();
    }
}
