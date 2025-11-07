package com.smartmeeting.frontend;

import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.frontend.service.FrontendPessoaService;
import com.smartmeeting.frontend.service.FrontendSalaService;
import com.smartmeeting.frontend.service.ReuniaoService;
import com.smartmeeting.frontend.service.SessionManager;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.Alert.AlertType;
import javafx.stage.Stage;
import javafx.scene.layout.VBox;
import javafx.scene.control.Label;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

public class CreateReuniaoController {

    @FXML
    private TextField pautaField;
    @FXML
    private DatePicker datePicker;
    @FXML
    private TextField duracaoField;
    @FXML
    private ComboBox<SalaDTO> salaComboBox; // Alterado para ComboBox
    @FXML
    private ComboBox<PessoaDTO> organizadorComboBox; // Alterado para ComboBox
    @FXML
    private ListView<PessoaDTO> participantesDisponiveisListView;
    @FXML
    private ListView<PessoaDTO> participantesSelecionadosListView;
    @FXML
    private TextArea ataTextArea;
    @FXML
    private Button saveButton;
    @FXML
    private Button cancelButton;
    @FXML
    private Label statusLabel;

    private ReuniaoService reuniaoService = new ReuniaoService();
    private FrontendSalaService frontendSalaService = new FrontendSalaService(); // Novo serviço
    private FrontendPessoaService frontendPessoaService = new FrontendPessoaService(); // Novo serviço

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // Wizard state and panes
    @FXML private VBox step1Pane;
    @FXML private VBox step2Pane;
    @FXML private VBox step3Pane;
    @FXML private Button navPrevButton;
    @FXML private Button navNextButton;
    @FXML private Label wizardProgressLabel;
    private int currentStep = 1;

    private void updateStepUI() {
        boolean s1 = currentStep == 1;
        boolean s2 = currentStep == 2;
        boolean s3 = currentStep == 3;

        if (step1Pane != null) { step1Pane.setVisible(s1); step1Pane.setManaged(s1); }
        if (step2Pane != null) { step2Pane.setVisible(s2); step2Pane.setManaged(s2); }
        if (step3Pane != null) { step3Pane.setVisible(s3); step3Pane.setManaged(s3); }

        if (navPrevButton != null) { navPrevButton.setVisible(!s1); navPrevButton.setManaged(!s1); }
        if (navNextButton != null) { navNextButton.setVisible(!s3); navNextButton.setManaged(!s3); }
        if (saveButton != null) { saveButton.setVisible(s3); saveButton.setManaged(s3); }

        if (wizardProgressLabel != null) {
            wizardProgressLabel.setText("Passo " + currentStep + " de 3");
        }
    }

    @FXML
    public void initialize() {
        // Carregar salas e pessoas em threads separadas para não bloquear a UI
        new Thread(() -> {
            try {
                List<SalaDTO> salas = frontendSalaService.getAllSalas();
                List<PessoaDTO> pessoas = frontendPessoaService.getAllPessoas();

                Platform.runLater(() -> {
                    // Popular ComboBox de salas
                    ObservableList<SalaDTO> observableSalas = FXCollections.observableArrayList(salas);
                    salaComboBox.setItems(observableSalas);
                    salaComboBox.setConverter(new javafx.util.StringConverter<SalaDTO>() {
                        @Override
                        public String toString(SalaDTO sala) {
                            return sala != null ? sala.getNome() : "";
                        }

                        @Override
                        public SalaDTO fromString(String string) {
                            return salaComboBox.getItems().stream()
                                    .filter(s -> s.getNome().equals(string))
                                    .findFirst()
                                    .orElse(null);
                        }
                    });

                    // Popular ComboBox de organizadores
                    ObservableList<PessoaDTO> observablePessoas = FXCollections.observableArrayList(pessoas);
                    organizadorComboBox.setItems(observablePessoas);
                    organizadorComboBox.setConverter(new javafx.util.StringConverter<PessoaDTO>() {
                        @Override
                        public String toString(PessoaDTO pessoa) {
                            return pessoa != null ? pessoa.getNome() : "";
                        }

                        @Override
                        public PessoaDTO fromString(String string) {
                            return organizadorComboBox.getItems().stream()
                                    .filter(p -> p.getNome().equals(string))
                                    .findFirst()
                                    .orElse(null);
                        }
                    });

                    // Popular listas de participantes (dual list)
                    participantesDisponiveisListView.setItems(FXCollections.observableArrayList(observablePessoas));
                    participantesDisponiveisListView.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
                    participantesSelecionadosListView.setItems(FXCollections.observableArrayList());
                    participantesSelecionadosListView.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
                    // Renderização por nome
                    participantesDisponiveisListView.setCellFactory(lv -> new ListCell<PessoaDTO>() {
                        @Override
                        protected void updateItem(PessoaDTO pessoa, boolean empty) {
                            super.updateItem(pessoa, empty);
                            setText(empty || pessoa == null ? "" : pessoa.getNome());
                        }
                    });
                    participantesSelecionadosListView.setCellFactory(lv -> new ListCell<PessoaDTO>() {
                        @Override
                        protected void updateItem(PessoaDTO pessoa, boolean empty) {
                            super.updateItem(pessoa, empty);
                            setText(empty || pessoa == null ? "" : pessoa.getNome());
                        }
                    });

                    // Preencher organizador com o usuário logado, se disponível
                    PessoaDTO usuarioLogado = SessionManager.getInstance().getUsuarioLogado();
                    if (usuarioLogado != null) {
                        organizadorComboBox.getSelectionModel().select(usuarioLogado);
                        // organizadorComboBox.setDisable(true); // Opcional: Impede edição se for o usuário logado
                    }
                });
            } catch (IOException | InterruptedException e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro de Carregamento", "Falha ao carregar dados", "Não foi possível carregar salas ou pessoas. Detalhes: " + e.getMessage());
                    e.printStackTrace();
                });
            }
        }).start();

        // inicia wizard no passo 1
        updateStepUI();
    }

    @FXML
    private void handleNextStep() {
        if (currentStep == 1) {
            // Validação mínima antes de avançar (opcional comentar se não quiser travar)
            if (pautaField.getText() == null || pautaField.getText().isBlank() || datePicker.getValue() == null) {
                showAlert(AlertType.WARNING, "Campos Obrigatórios", "Preencha os campos principais", "Informe Pauta e Data antes de continuar.");
                return;
            }
        }
        if (currentStep < 3) {
            currentStep++;
            updateStepUI();
        }
    }

    @FXML
    private void handlePrevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    }

    @FXML
    private void handleAddParticipants() {
        ObservableList<PessoaDTO> selecionados = participantesDisponiveisListView.getSelectionModel().getSelectedItems();
        if (selecionados == null || selecionados.isEmpty()) return;
        // mover mantendo ordem
        List<PessoaDTO> toMove = selecionados.stream().collect(Collectors.toList());
        participantesSelecionadosListView.getItems().addAll(toMove);
        participantesDisponiveisListView.getItems().removeAll(toMove);
        participantesDisponiveisListView.getSelectionModel().clearSelection();
    }

    @FXML
    private void handleRemoveParticipants() {
        ObservableList<PessoaDTO> selecionados = participantesSelecionadosListView.getSelectionModel().getSelectedItems();
        if (selecionados == null || selecionados.isEmpty()) return;
        List<PessoaDTO> toMove = selecionados.stream().collect(Collectors.toList());
        participantesDisponiveisListView.getItems().addAll(toMove);
        participantesSelecionadosListView.getItems().removeAll(toMove);
        participantesSelecionadosListView.getSelectionModel().clearSelection();
    }

    @FXML
    private void handleSaveReuniao() {
        // 1. Coletar dados
        String pauta = pautaField.getText();
        LocalDate date = datePicker.getValue();
        String duracaoText = duracaoField.getText();
        SalaDTO salaSelecionada = salaComboBox.getSelectionModel().getSelectedItem(); // Obter sala selecionada
        PessoaDTO organizadorSelecionado = organizadorComboBox.getSelectionModel().getSelectedItem(); // Obter organizador selecionado
        ObservableList<PessoaDTO> participantesSelecionados = participantesSelecionadosListView.getItems(); // Participantes selecionados
        String ata = ataTextArea.getText();

        // 2. Validação básica
        if (pauta.isEmpty() || date == null || duracaoText.isEmpty() || salaSelecionada == null || organizadorSelecionado == null) {
            showAlert(AlertType.WARNING, "Campos Obrigatórios", "Preencha todos os campos obrigatórios.", "Pauta, Data, Duração, Sala e Organizador são obrigatórios.");
            return;
        }

        // Como não há campo de hora na UI, usar 00:00 como padrão
        LocalTime time = LocalTime.MIDNIGHT;

        int duracaoMinutos;
        try {
            duracaoMinutos = Integer.parseInt(duracaoText);
            if (duracaoMinutos <= 0) {
                showAlert(AlertType.WARNING, "Duração Inválida", "Duração deve ser positiva.", "A duração da reunião deve ser um número inteiro maior que zero.");
                return;
            }
        } catch (NumberFormatException e) {
            showAlert(AlertType.WARNING, "Duração Inválida", "Formato de duração incorreto.", "Por favor, insira um número inteiro para a duração em minutos.");
            return;
        }

        LocalDateTime dataHoraInicio = LocalDateTime.of(date, time);

        // 3. Criar DTO
        ReuniaoDTO novaReuniao = new ReuniaoDTO();
        novaReuniao.setPauta(pauta);
        novaReuniao.setDataHoraInicio(dataHoraInicio);
        novaReuniao.setDuracaoMinutos(duracaoMinutos);
        novaReuniao.setStatus(StatusReuniao.AGENDADA); // Nova reunião é sempre agendada

        // Definir Sala
        novaReuniao.setSalaId(salaSelecionada.getId());
        novaReuniao.setSala(salaSelecionada); // Opcional, dependendo de como o backend processa

        // Definir Organizador
        novaReuniao.setOrganizadorId(organizadorSelecionado.getId());
        novaReuniao.setOrganizador(organizadorSelecionado); // Opcional

        // Definir Participantes
        if (!participantesSelecionados.isEmpty()) {
            List<PessoaDTO> participantes = participantesSelecionados.stream().collect(Collectors.toList());
            novaReuniao.setParticipantes(participantes);
            novaReuniao.setParticipantesIds(participantes.stream().map(PessoaDTO::getId).collect(Collectors.toList()));
        }

        if (!ata.isEmpty()) {
            novaReuniao.setAta(ata);
        }

        // 4. Chamar o serviço em uma nova thread
        saveButton.setDisable(true);
        statusLabel.setText("Salvando reunião...");
        statusLabel.setVisible(true);
        statusLabel.setManaged(true);

        new Thread(() -> {
            try {
                ReuniaoDTO reuniaoCriada = reuniaoService.createReuniao(novaReuniao);
                Platform.runLater(() -> {
                    showAlert(AlertType.INFORMATION, "Sucesso", "Reunião Criada", "A reunião '" + reuniaoCriada.getPauta() + "' foi criada com sucesso!");
                    // Fechar o diálogo (se aberto via openDialog) e voltar para a lista de reuniões
                    try {
                        Stage stage = (Stage) saveButton.getScene().getWindow();
                        if (stage != null) stage.close();
                    } catch (Exception ignored) {}
                    MainApp.setRoot("ReunioesView");
                });
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro de Criação", "Falha ao criar reunião", "Não foi possível criar a reunião. Detalhes: " + e.getMessage());
                    e.printStackTrace();
                });
            } catch (Exception e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro Inesperado", "Ocorreu um erro inesperado.", "Detalhes: " + e.getMessage());
                    e.printStackTrace();
                });
            } finally {
                Platform.runLater(() -> {
                    saveButton.setDisable(false);
                    statusLabel.setVisible(false);
                    statusLabel.setManaged(false);
                });
            }
        }).start();
    }

    @FXML
    private void handleCancel() {
        // Navegar de volta para a tela de reuniões
        MainApp.setRoot("ReunioesView");
    }

    private void showAlert(AlertType alertType, String title, String header, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        alert.showAndWait();
    }
}
