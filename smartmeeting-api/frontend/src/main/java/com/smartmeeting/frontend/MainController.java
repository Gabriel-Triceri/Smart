package com.smartmeeting.frontend;

import com.smartmeeting.dto.DashboardDTO;
import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.frontend.components.MeetingCardController;
import com.smartmeeting.frontend.components.StatCardController;
import com.smartmeeting.frontend.service.DashboardService;
import com.smartmeeting.frontend.service.ReuniaoService;
import com.smartmeeting.frontend.service.SessionManager;
import de.jensd.fx.glyphs.fontawesome.FontAwesomeIcon;
import de.jensd.fx.glyphs.fontawesome.FontAwesomeIconView;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

import static com.smartmeeting.enums.StatusReuniao.AGENDADA;

public class MainController {

    @FXML
    private Label welcomeLabel;
    @FXML
    private Button logoutButton;
    @FXML
    private Button notificationsButton;
    @FXML
    private Label currentViewTitle; // Novo FXML ID para o título da view atual

    // Botões de Navegação
    @FXML
    private Button dashboardButton;
    @FXML
    private Button reunioesButton;
    @FXML
    private Button tarefasButton;
    @FXML
    private Button salasButton;
    @FXML
    private Button pessoasButton;
    @FXML
    private Button relatoriosButton;
    @FXML
    private Button configuracoesButton;

    // Lista para gerenciar os botões de navegação
    private List<Button> navButtons;

    // Injeção dos controladores dos componentes StatCard
    @FXML
    private StatCardController reunioesHojeCardController;
    @FXML
    private StatCardController tarefasPendentesCardController;
    @FXML
    private StatCardController reunioesSemanaCardController;
    @FXML
    private StatCardController taxaConclusaoCardController;

    @FXML
    private ListView<ReuniaoDTO> reunioesListView;

    @FXML
    private StackPane contentArea; // Área onde as views serão carregadas

    // Variável para armazenar o conteúdo inicial do dashboard
    private Node initialDashboardContent;

    private DashboardService dashboardService = new DashboardService();
    private ReuniaoService reuniaoService = new ReuniaoService();

    @FXML
    public void initialize() {
        // Inicializa a lista de botões de navegação
        navButtons = Arrays.asList(
                dashboardButton,
                reunioesButton,
                tarefasButton,
                salasButton,
                pessoasButton,
                relatoriosButton,
                configuracoesButton
        );

        setupIcons();
        setupReunioesListView();
        loadDashboardData();
        loadReunioesData();

        // Define o botão Dashboard como ativo inicialmente
        dashboardButton.getStyleClass().add("active");
        currentViewTitle.setText("Dashboard"); // Define o título inicial

        // Adiciona listeners para os botões de navegação
        dashboardButton.setOnAction(event -> handleNavigation(dashboardButton, "DashboardContent", "Dashboard"));
        reunioesButton.setOnAction(event -> handleNavigation(reunioesButton, "ReunioesView", "Reuniões"));
        // TODO: Adicionar handlers para os outros botões

        // Captura o conteúdo inicial do dashboard que já está no contentArea
        // Isso deve ser feito após o FXML ter sido carregado e o contentArea populado
        if (contentArea != null && !contentArea.getChildren().isEmpty()) {
            initialDashboardContent = contentArea.getChildren().get(0);
        }
    }

    private void setupIcons() {
        Color iconColor = Color.web("#BBDEFB"); // Um azul claro para combinar com o gradiente
        Color topBarIconColor = Color.web("#616161"); // Cor para ícones da barra superior

        // Ícones da Barra Superior
        FontAwesomeIconView bellIcon = new FontAwesomeIconView(FontAwesomeIcon.BELL, "1.2em");
        bellIcon.setFill(topBarIconColor);
        notificationsButton.setGraphic(bellIcon);
        notificationsButton.setText(""); // Remover texto se houver

        FontAwesomeIconView logoutIcon = new FontAwesomeIconView(FontAwesomeIcon.SIGN_OUT, "1.2em");
        logoutIcon.setFill(Color.WHITE); // Cor do ícone de logout
        logoutButton.setGraphic(logoutIcon);
        logoutButton.setText("Sair"); // Garante que o texto seja 'Sair'

        // Ícones da Barra Lateral
        FontAwesomeIconView dashboardIcon = new FontAwesomeIconView(FontAwesomeIcon.DASHBOARD, "1.2em");
        dashboardIcon.setFill(iconColor);
        dashboardButton.setGraphic(dashboardIcon);

        FontAwesomeIconView reunioesIcon = new FontAwesomeIconView(FontAwesomeIcon.CALENDAR, "1.2em");
        reunioesIcon.setFill(iconColor);
        reunioesButton.setGraphic(reunioesIcon);

        FontAwesomeIconView tarefasIcon = new FontAwesomeIconView(FontAwesomeIcon.TASKS, "1.2em");
        tarefasIcon.setFill(iconColor);
        tarefasButton.setGraphic(tarefasIcon);

        FontAwesomeIconView salasIcon = new FontAwesomeIconView(FontAwesomeIcon.BUILDING, "1.2em");
        salasIcon.setFill(iconColor);
        salasButton.setGraphic(salasIcon);

        FontAwesomeIconView pessoasIcon = new FontAwesomeIconView(FontAwesomeIcon.USERS, "1.2em");
        pessoasIcon.setFill(iconColor);
        pessoasButton.setGraphic(pessoasIcon);

        FontAwesomeIconView relatoriosIcon = new FontAwesomeIconView(FontAwesomeIcon.BAR_CHART, "1.2em");
        relatoriosIcon.setFill(iconColor);
        relatoriosButton.setGraphic(relatoriosIcon);

        FontAwesomeIconView configuracoesIcon = new FontAwesomeIconView(FontAwesomeIcon.COG, "1.2em");
        configuracoesIcon.setFill(iconColor);
        configuracoesButton.setGraphic(configuracoesIcon);
    }

    private void setupReunioesListView() {
        reunioesListView.setCellFactory(lv -> new com.smartmeeting.frontend.components.ReuniaoListCell());
    }

    private void loadDashboardData() {
        new Thread(() -> {
            try {
                DashboardDTO dashboardData = dashboardService.getDashboardData();
                Platform.runLater(() -> {
                    // TODO: Buscar nome do usuário logado
                    // welcomeLabel.setText("Bem-vindo, " + ...);

                    // Popula os cards
                    reunioesHojeCardController.setTitle("Reuniões Hoje");
                    reunioesHojeCardController.setValue(String.valueOf(dashboardData.getEstatisticasGerais().getTotalReunioesEmAndamento()));

                    tarefasPendentesCardController.setTitle("Tarefas Pendentes");
                    tarefasPendentesCardController.setValue(String.valueOf(dashboardData.getEstatisticasGerais().getTotalTarefasPendentes()));

                    reunioesSemanaCardController.setTitle("Reuniões Agendadas");
                    reunioesSemanaCardController.setValue(String.valueOf(dashboardData.getEstatisticasGerais().getTotalReunioesAgendadas()));

                    taxaConclusaoCardController.setTitle("Taxa de Conclusão");
                    taxaConclusaoCardController.setValue(String.format("%.1f%%", dashboardData.getEstatisticasGerais().getTaxaConclusaoTarefas()));
                });
            } catch (Exception e) {
                e.printStackTrace();
                String msg = e.getMessage() != null ? e.getMessage() : "";
                if (msg.contains("HTTP 401")) {
                    SessionManager.getInstance().logout();
                    Platform.runLater(() -> MainApp.setRoot("LoginView"));
                } else {
                    Platform.runLater(() -> showAlert(AlertType.ERROR, "Erro de Dashboard", "Falha ao carregar dados do dashboard", "Não foi possível obter os dados do dashboard. Verifique sua conexão e o backend. Detalhes: " + msg));
                }
            }
        }).start();
    }

    private void loadReunioesData() {
        new Thread(() -> {
            try {
                List<ReuniaoDTO> reunioes = reuniaoService.getAllReunioes();
                Platform.runLater(() -> {
                    ObservableList<ReuniaoDTO> observableReunioes = FXCollections.observableArrayList(reunioes);
                    reunioesListView.setItems(observableReunioes);
                });
            } catch (Exception e) {
                e.printStackTrace();
                String msg = e.getMessage() != null ? e.getMessage() : "";
                if (msg.contains("HTTP 401")) {
                    SessionManager.getInstance().logout();
                    Platform.runLater(() -> MainApp.setRoot("LoginView"));
                } else {
                    Platform.runLater(() -> showAlert(AlertType.ERROR, "Erro de Reuniões", "Falha ao carregar reuniões", "Não foi possível obter a lista de reuniões. Verifique sua conexão e o backend. Detalhes: " + msg));
                }
            }
        }).start();
    }

    // Método para carregar FXMLs na contentArea
    private void loadView(String fxmlFileName) {
        try {
            // Se for o DashboardContent, restauramos o conteúdo inicial
            if ("DashboardContent".equals(fxmlFileName)) {
                if (initialDashboardContent != null) {
                    contentArea.getChildren().setAll(initialDashboardContent);
                } else {
                    // Caso o initialDashboardContent não tenha sido capturado (improvável se o FXML estiver correto)
                    Platform.runLater(() -> showAlert(AlertType.ERROR, "Erro de Navegação", "Conteúdo do Dashboard não encontrado", "Não foi possível restaurar o conteúdo inicial do dashboard."));
                }
                return;
            }
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlFileName + ".fxml"));
            Node view = loader.load();
            contentArea.getChildren().setAll(view);
        } catch (IOException e) {
            e.printStackTrace();
            Platform.runLater(() -> showAlert(AlertType.ERROR, "Erro de Navegação", "Falha ao carregar tela", "Não foi possível carregar a tela: " + fxmlFileName + ". Detalhes: " + e.getMessage()));
        }
    }

    private void handleNavigation(Button clickedButton, String fxmlViewName, String viewTitle) {
        // Remove a classe 'active' de todos os botões
        for (Button button : navButtons) {
            button.getStyleClass().remove("active");
        }

        // Adiciona a classe 'active' ao botão clicado
        clickedButton.getStyleClass().add("active");

        // Define o título da view atual
        currentViewTitle.setText(viewTitle);

        // Carrega a view correspondente na contentArea
        loadView(fxmlViewName);
    }

    @FXML
    private void handleLogoutButtonAction() {
        SessionManager.getInstance().logout();
        MainApp.setRoot("LoginView");
    }

    // Método auxiliar para exibir alertas
    private void showAlert(AlertType alertType, String title, String header, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);

        alert.showAndWait();
    }
}
