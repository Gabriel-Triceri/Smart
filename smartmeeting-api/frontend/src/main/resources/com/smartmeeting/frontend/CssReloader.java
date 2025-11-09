package com.smartmeeting.frontend.util;

import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.stage.Window;

import java.nio.file.Files;
import java.nio.file.Path;

public class CssReloader {

    /**
     * Recarrega o CSS a partir de um caminho de arquivo local (.css).
     * Isso permite ver as mudanças imediatamente sem recompilar.
     */
    public static void reloadFromFile(Scene scene, Path cssPath) {
        try {
            if (!Files.exists(cssPath)) {
                System.out.println("⚠️ CSS file not found: " + cssPath);
                return;
            }

            String cssUrl = cssPath.toUri().toString();
            System.out.println("🎨 CSS alterado — recarregando: " + cssUrl);

            Platform.runLater(() -> {
                for (Window window : Window.getWindows()) {
                    if (window != null && window.getScene() != null) {
                        Scene s = window.getScene();
                        s.getStylesheets().clear();
                        s.getStylesheets().add(cssUrl);

                        // 🔁 Força a atualização do layout
                        s.getRoot().applyCss();
                        s.getRoot().layout();
                    }
                }

                System.out.println("✅ CSS recarregado e reaplicado corretamente de: " + cssUrl);
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
