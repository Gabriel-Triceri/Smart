package com.smartmeeting.frontend;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.frontend.service.ReuniaoService;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader; // Import adicionado
import javafx.scene.Parent; // Import adicionado
import javafx.scene.control.*;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.layout.AnchorPane;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class ReunioesController {

    @FXML
    private DatePicker startDatePicker;
    @FXML
    private DatePicker endDatePicker;
    @FXML
    private TextField searchField;
    @FXML
    private TableView<ReuniaoDTO> reunioesTableView;
    @FXML
    private TableColumn<ReuniaoDTO, String> pautaColumn;
    @FXML
    private TableColumn<ReuniaoDTO, String> salaColumn;
    @FXML
    private TableColumn<ReuniaoDTO, String> dataHoraColumn;
    @FXML
    private TableColumn<ReuniaoDTO, String> participantesColumn;
    @FXML
    private TableColumn<ReuniaoDTO, String> statusColumn;
    @FXML
    private TableColumn<ReuniaoDTO, ReuniaoDTO> acoesColumn;

    @FXML
    private VBox detailPanel;
    @FXML
    private Label detailPauta;
    @FXML
    private Label detailSala;
    @FXML
    private Label detailDataHora;
    @FXML
    private Label detailDuracao;
    @FXML
    private Label detailOrganizador;
    @FXML
    private Label detailStatus;
    @FXML
    private Label detailParticipantes;
    @FXML
    private TextArea detailAta;
    @FXML
    private ListView<String> detailTarefasListView; // Novo campo para exibir as tarefas

    @FXML
    private AnchorPane overlayPane;

    private ReuniaoService reuniaoService = new ReuniaoService();
    private ObservableList<ReuniaoDTO> masterReunioesData = FXCollections.observableArrayList();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @FXML
    public void initialize() {
        setupTableView();
        loadReunioes();

        // Listener para seleção de linha na tabela
        reunioesTableView.getSelectionModel().selectedItemProperty().addListener((obs, oldSelection, newSelection) -> {
            if (newSelection != null) {
                showReuniaoDetails(newSelection);
            }
        });

        // TODO: Para estilizar o painel de detalhes e a lista de tarefas, você precisará:
        // 1. Modificar o arquivo FXML correspondente (ex: ReunioesView.fxml) para:
        //    - Adicionar um Label para "Tarefas:" e o ListView com fx:id="detailTarefasListView".
        //    - Aplicar classes de estilo (ex: styleClass="detail-panel", styleClass="task-list-view")
        //      aos elementos relevantes no FXML.
        // 2. Modificar seu arquivo CSS (ex: application.css) para definir os estilos
        //    para as classes CSS que você aplicou no FXML.
    }

    private void setupTableView() {
        pautaColumn.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getPauta()));
        salaColumn.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getSala() != null ? cellData.getValue().getSala().getNome() : "N/A"));
        dataHoraColumn.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getDataHoraInicio().format(FORMATTER)));
        participantesColumn.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getParticipantes() != null ? String.valueOf(cellData.getValue().getParticipantes().size()) : "0"));

        // Configuração da coluna de Status com estilo de badge
        statusColumn.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getStatus().toString()));
        statusColumn.setCellFactory(column -> {
            return new TableCell<ReuniaoDTO, String>() {
                @Override
                protected void updateItem(String item, boolean empty) {
                    super.updateItem(item, empty);
                    if (item == null || empty) {
                        setGraphic(null);
                        setText(null);
                        setStyle("");
                    } else {
                        Label statusLabel = new Label(item);
                        statusLabel.getStyleClass().add("meeting-status");
                        // Adiciona a classe específica baseada no status
                        switch (item) {
                            case "AGENDADA":
                                statusLabel.getStyleClass().add("status-agendada");
                                break;
                            case "EM_ANDAMENTO":
                                statusLabel.getStyleClass().add("status-em-andamento");
                                break;
                            case "FINALIZADA":
                                statusLabel.getStyleClass().add("status-finalizada");
                                break;
                            case "CANCELADA":
                                statusLabel.getStyleClass().add("status-cancelada");
                                break;
                            default:
                                statusLabel.getStyleClass().add("status-agendada"); // fallback
                                break;
                        }
                        setGraphic(statusLabel);
                        setText(null);
                    }
                }
            };
        });

        // Coluna de Ações
        acoesColumn.setSortable(false);
        // Garante que a coluna tenha um item por linha (o próprio ReuniaoDTO)
        acoesColumn.setCellValueFactory(param -> new javafx.beans.property.ReadOnlyObjectWrapper<>(param.getValue()));
        acoesColumn.setCellFactory(param -> new TableCell<ReuniaoDTO, ReuniaoDTO>() {
            private final Button encerrarButton = new Button("\u2713"); // Checkmark (verde)
            private final Button editButton = new Button("\u270F"); // Lápis (amarelo)
            private final Button deleteButton = new Button("\u2716"); // X (vermelho)

            {
                encerrarButton.getStyleClass().addAll("success-button", "action-button-small");
                editButton.getStyleClass().addAll("warning-button", "action-button-small");
                deleteButton.getStyleClass().addAll("danger-button", "action-button-small");

                encerrarButton.setOnAction(event -> {
                    ReuniaoDTO reuniao = getItem();
                    System.out.println("Encerrar Reunião: " + reuniao.getPauta());
                    // TODO: Implementar lógica de encerrar
                });
                editButton.setOnAction(event -> {
                    ReuniaoDTO reuniao = getItem();
                    handleEditReuniao(reuniao); // Chama o novo método para editar
                });
                deleteButton.setOnAction(event -> {
                    ReuniaoDTO reuniao = getItem();
                    System.out.println("Excluir Reunião: " + reuniao.getPauta());
                    // TODO: Implementar lógica de exclusão
                });
            }

            @Override
            protected void updateItem(ReuniaoDTO item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    HBox buttonsBox = new HBox(5, encerrarButton, editButton, deleteButton);
                    buttonsBox.setAlignment(javafx.geometry.Pos.CENTER); // Centraliza os botões na célula
                    setContentDisplay(ContentDisplay.GRAPHIC_ONLY);
                    setGraphic(buttonsBox);
                }
            }
        });
    }

    private void loadReunioes() {
        new Thread(() -> {
            try {
                List<ReuniaoDTO> reunioes = reuniaoService.getAllReunioes();
                Platform.runLater(() -> {
                    masterReunioesData.setAll(reunioes);
                    reunioesTableView.setItems(masterReunioesData);
                });
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro de Carregamento", "Falha ao carregar reuniões", "Não foi possível obter a lista de reuniões. Verifique sua conexão e o backend. Detalhes: " + e.getMessage());
                });
                e.printStackTrace();
            }
        }).start();
    }

    private void showReuniaoDetails(ReuniaoDTO reuniao) {
        detailPauta.setText(reuniao.getPauta());
        detailSala.setText(reuniao.getSala() != null ? reuniao.getSala().getNome() + " (" + reuniao.getSala().getLocalizacao() + ")" : "N/A");
        detailDataHora.setText(reuniao.getDataHoraInicio().format(FORMATTER));
        detailDuracao.setText(reuniao.getDuracaoMinutos() + " minutos");
        detailOrganizador.setText(reuniao.getOrganizador() != null ? reuniao.getOrganizador().getNome() : "N/A");
        detailStatus.setText(reuniao.getStatus().toString());
        detailParticipantes.setText(reuniao.getParticipantes() != null ? reuniao.getParticipantes().stream().map(p -> p.getNome()).collect(Collectors.joining(", ")) : "N/A");
        detailAta.setText(reuniao.getAta() != null && !reuniao.getAta().isEmpty() ? reuniao.getAta() : "Nenhuma ata disponível.");

        // Adicionar tarefas
        if (reuniao.getTarefas() != null && !reuniao.getTarefas().isEmpty()) {
            detailTarefasListView.setItems(FXCollections.observableArrayList(reuniao.getTarefas()));
        } else {
            detailTarefasListView.setItems(FXCollections.observableArrayList("Nenhuma tarefa disponível."));
        }

        if (overlayPane != null) {
            overlayPane.setVisible(true);
            overlayPane.setManaged(true);
        } else {
            // fallback caso overlayPane não esteja no FXML (compatibilidade)
            detailPanel.setVisible(true);
            detailPanel.setManaged(true);
        }
    }

    @FXML
    private void handleApplyFilter() {
        LocalDate startDate = startDatePicker.getValue();
        LocalDate endDate = endDatePicker.getValue();
        String searchText = searchField.getText().toLowerCase();

        List<ReuniaoDTO> filteredList = masterReunioesData.stream()
                .filter(reuniao -> {
                    boolean matchesDate = true;
                    if (startDate != null && reuniao.getDataHoraInicio().toLocalDate().isBefore(startDate)) {
                        matchesDate = false;
                    }
                    if (endDate != null && reuniao.getDataHoraInicio().toLocalDate().isAfter(endDate)) {
                        matchesDate = false;
                    }
                    boolean matchesSearch = searchText.isEmpty() ||
                            (reuniao.getOrganizador() != null && reuniao.getOrganizador().getNome().toLowerCase().contains(searchText));
                    return matchesDate && matchesSearch;
                })
                .collect(Collectors.toList());

        reunioesTableView.setItems(FXCollections.observableArrayList(filteredList));
    }

    @FXML
    private void handleCloseDetails() {
        if (overlayPane != null) {
            overlayPane.setVisible(false);
            overlayPane.setManaged(false);
            reunioesTableView.getSelectionModel().clearSelection();
        } else if (detailPanel != null) {
            detailPanel.setVisible(false);
            detailPanel.setManaged(false);
            reunioesTableView.getSelectionModel().clearSelection();
        }
    }

    @FXML
    private void handleCreateReuniao() {
        // Abre a tela de criação como diálogo, mantendo o programa ao fundo
        MainApp.openDialog("CreateReuniaoView", "Criar Reunião", 700, 550, true);
    }

    // Novo método para lidar com a ação de edição do botão no painel de detalhes
    @FXML
    public void handleEditSelectedReuniao() {
        ReuniaoDTO selectedReuniao = reunioesTableView.getSelectionModel().getSelectedItem();
        if (selectedReuniao != null) {
            handleEditReuniao(selectedReuniao);
        } else {
            showAlert(AlertType.WARNING, "Nenhuma Reunião Selecionada", "Selecione uma reunião para editar.", "Por favor, selecione uma reunião na tabela para poder editá-la.");
        }
    }

    // Método atualizado para lidar com a edição de reunião (agora chamado internamente ou pela célula da tabela)
    private void handleEditReuniao(ReuniaoDTO reuniaoToEdit) {
        if (reuniaoToEdit == null || reuniaoToEdit.getId() == null) {
            showAlert(AlertType.ERROR, "Erro de Edição", "Reunião Inválida", "Não foi possível obter os detalhes da reunião para edição.");
            return;
        }

        new Thread(() -> {
            try {
                // 1. Fetch full meeting details from the backend
                ReuniaoDTO fullReuniaoDetails = reuniaoService.getReuniaoById(reuniaoToEdit.getId());

                Platform.runLater(() -> {
                    try {
                        FXMLLoader loader = new FXMLLoader(getClass().getResource("EditReuniaoView.fxml"));
                        Parent root = loader.load();
                        EditReuniaoController controller = loader.getController();
                        controller.setReuniaoToEdit(fullReuniaoDetails); // Pass the full details
                        // Abrir como diálogo não modal para manter o programa ao fundo
                        MainApp.openDialogWithRoot(root, "Editar Reunião", 700, 550, false);
                    } catch (IOException e) {
                        e.printStackTrace();
                        showAlert(AlertType.ERROR, "Erro de Edição", "Falha ao abrir tela de edição", "Não foi possível carregar a tela de edição da reunião. Detalhes: " + e.getMessage());
                    }
                });
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro de Carregamento", "Falha ao carregar detalhes da reunião", "Não foi possível obter os detalhes completos da reunião. Verifique sua conexão e o backend. Detalhes: " + e.getMessage());
                });
                e.printStackTrace();
            }
        }).start();
    }

    @FXML
    private void handleEncerrarReuniao() {
        ReuniaoDTO selectedReuniao = reunioesTableView.getSelectionModel().getSelectedItem();
        if (selectedReuniao != null) {
            System.out.println("Encerrar Reunião: " + selectedReuniao.getPauta());
            // TODO: Implementar lógica de encerrar
        }
    }

    @FXML
    private void handleDeleteReuniao() {
        ReuniaoDTO selectedReuniao = reunioesTableView.getSelectionModel().getSelectedItem();
        if (selectedReuniao != null) {
            System.out.println("Excluir Reunião: " + selectedReuniao.getPauta());
            // TODO: Implementar lógica de exclusão
        }
    }

    // Método auxiliar para exibir alertas (copiado do MainController)
    private void showAlert(AlertType alertType, String title, String header, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        alert.showAndWait();
    }

    @FXML
    private void handleReloadCss() {
        MainApp.reloadCss();
    }
}
