package com.smartmeeting.frontend;

import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.frontend.service.ReuniaoService;
import com.smartmeeting.frontend.service.SessionManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.image.ImageView;
import javafx.scene.image.Image;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class EditReuniaoController {

    @FXML
    private TextField pautaField;
    @FXML
    private TextField dataHoraField;
    @FXML
    private TextField duracaoField;
    @FXML
    private TextField salaField;
    @FXML
    private TextField organizadorField;
    @FXML
    private TextArea participantesTextArea;
    @FXML
    private TextArea ataTextArea;
    @FXML
    private Button editButton;
    @FXML
    private Button endButton;
    @FXML
    private Button deleteButton;
    @FXML
    private Label statusLabel;
    @FXML
    private VBox tasksContainer;

    private ReuniaoService reuniaoService = new ReuniaoService();
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private ReuniaoDTO reuniaoToEdit; // Reunião que está sendo visualizada/editada

    // Classe interna simples para representar uma Tarefa (substituir por DTO real se existir)
    public static class Tarefa {
        private String descricao;
        private boolean concluida;

        public Tarefa(String descricao, boolean concluida) {
            this.descricao = descricao;
            this.concluida = concluida;
        }

        public String getDescricao() {
            return descricao;
        }

        public boolean isConcluida() {
            return concluida;
        }
    }

    // Método para injetar a reunião a ser editada
    public void setReuniaoToEdit(ReuniaoDTO reuniao) {
        this.reuniaoToEdit = reuniao;
        fillFormWithReuniaoData();
        setEditable(true); // Abre já em modo de edição conforme solicitado
        updateButtonVisibility(true); // Botão principal vira "Salvar"
    }

    @FXML
    public void initialize() {
        // Opcional: Preencher organizador com o usuário logado, se disponível
        if (SessionManager.getInstance().getUsuarioLogado() != null) {
            // organizadorField.setText(SessionManager.getInstance().getUsuarioLogado().getNome());
            // organizadorField.setDisable(true); // Impede edição se for o usuário logado
        }
        // Inicialmente, os campos são não editáveis. Isso será ajustado em setReuniaoToEdit.
        setEditable(false);

        // Configura a ação do botão de exclusão, que estava faltando
        if (deleteButton != null) {
            deleteButton.setOnAction(event -> handleDeleteReuniao());
        }
    }

    private void fillFormWithReuniaoData() {
        if (reuniaoToEdit != null) {
            pautaField.setText(reuniaoToEdit.getPauta());
            dataHoraField.setText(reuniaoToEdit.getDataHoraInicio().format(DATE_TIME_FORMATTER));
            duracaoField.setText(String.valueOf(reuniaoToEdit.getDuracaoMinutos()));
            salaField.setText(reuniaoToEdit.getSala() != null ? reuniaoToEdit.getSala().getNome() : "");
            organizadorField.setText(reuniaoToEdit.getOrganizador() != null ? reuniaoToEdit.getOrganizador().getNome() : "");
            
            if (reuniaoToEdit.getParticipantes() != null && !reuniaoToEdit.getParticipantes().isEmpty()) {
                String participantesEmails = reuniaoToEdit.getParticipantes().stream()
                        .map(PessoaDTO::getEmail)
                        .collect(Collectors.joining(", "));
                participantesTextArea.setText(participantesEmails);
            }
            ataTextArea.setText(reuniaoToEdit.getAta() != null ? reuniaoToEdit.getAta() : "");

            // Popular tarefas (exemplo com dados mockados)
            populateTasks(Arrays.asList(
                new Tarefa("Preparar apresentação", false),
                new Tarefa("Enviar convites", true),
                new Tarefa("Reservar sala", false)
            ));
        }
    }

    private void setEditable(boolean editable) {
        pautaField.setEditable(editable);
        dataHoraField.setEditable(editable);
        duracaoField.setEditable(editable);
        salaField.setEditable(editable);
        // organizadorField.setEditable(editable); // Pode ser desabilitado se for sempre o usuário logado
        participantesTextArea.setEditable(editable);
        ataTextArea.setEditable(editable);

        // O botão de salvar só aparece no modo de edição
        // saveButton.setVisible(editable);
        // saveButton.setManaged(editable);
        // cancelButton.setVisible(editable);
        // cancelButton.setManaged(editable);
    }

    private void updateButtonVisibility(boolean isEditing) {
        if (isEditing) {
            editButton.setText("Salvar");
            editButton.getStyleClass().setAll("success-button"); // Ou uma classe para salvar
            if (endButton != null) {
                endButton.setVisible(false);
                endButton.setManaged(false);
            }
            if (deleteButton != null) {
                deleteButton.setVisible(false);
                deleteButton.setManaged(false);
            }
            // Adicionar um botão de "Cancelar Edição" se necessário
        } else {
            editButton.setText("Editar");
            editButton.getStyleClass().setAll("edit-button");
            if (endButton != null) {
                endButton.setVisible(true);
                endButton.setManaged(true);
            }
            if (deleteButton != null) {
                deleteButton.setVisible(true);
                deleteButton.setManaged(true);
            }
        }
    }

    @FXML
    private void handleEditReuniao() {
        if (editButton.getText().equals("Editar")) {
            setEditable(true);
            updateButtonVisibility(true);
        } else { // É o botão "Salvar"
            handleSaveReuniao();
        }
    }

    private void handleSaveReuniao() {
        // 1. Coletar dados (similar ao CreateReuniaoController)
        String pauta = pautaField.getText();
        String dataHoraText = dataHoraField.getText();
        String duracaoText = duracaoField.getText();
        String salaNome = salaField.getText();
        String organizadorNome = organizadorField.getText();
        String participantesEmails = participantesTextArea.getText();
        String ata = ataTextArea.getText();

        // 2. Validação básica
        if (pauta.isEmpty() || dataHoraText.isEmpty() || duracaoText.isEmpty() || salaNome.isEmpty() || organizadorNome.isEmpty()) {
            showAlert(AlertType.WARNING, "Campos Obrigatórios", "Preencha todos os campos obrigatórios.", "Pauta, Data e Hora, Duração, Sala e Organizador são obrigatórios.");
            return;
        }

        LocalDateTime dataHoraInicio;
        try {
            dataHoraInicio = LocalDateTime.parse(dataHoraText, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            showAlert(AlertType.WARNING, "Formato de Data/Hora Inválido", "Formato de data ou hora incorreto.", "Por favor, use o formato dd/MM/yyyy HH:mm (ex: 25/12/2024 14:30).");
            return;
        }

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

        // 3. Atualizar DTO existente
        if (reuniaoToEdit == null) {
            showAlert(AlertType.ERROR, "Erro de Edição", "Reunião não encontrada", "Não foi possível encontrar a reunião para edição.");
            return;
        }

        reuniaoToEdit.setPauta(pauta);
        reuniaoToEdit.setDataHoraInicio(dataHoraInicio);
        reuniaoToEdit.setDuracaoMinutos(duracaoMinutos);
        // Status não é alterado na edição simples, mas pode ser adicionado um campo para isso se necessário
        // reuniaoToEdit.setStatus(StatusReuniao.AGENDADA); 

        SalaDTO sala = new SalaDTO();
        sala.setNome(salaNome);
        reuniaoToEdit.setSala(sala);

        PessoaDTO organizador = new PessoaDTO();
        organizador.setNome(organizadorNome);
        if (SessionManager.getInstance().getUsuarioLogado() != null && organizadorNome.equals(SessionManager.getInstance().getUsuarioLogado().getNome())) {
            organizador.setId(SessionManager.getInstance().getUsuarioLogado().getId());
            organizador.setEmail(SessionManager.getInstance().getUsuarioLogado().getEmail());
        }
        reuniaoToEdit.setOrganizador(organizador);

        if (!participantesEmails.isEmpty()) {
            List<PessoaDTO> participantes = Arrays.stream(participantesEmails.split(","))
                    .map(String::trim)
                    .filter(email -> !email.isEmpty())
                    .map(email -> {
                        PessoaDTO p = new PessoaDTO();
                        p.setEmail(email);
                        return p;
                    })
                    .collect(Collectors.toList());
            reuniaoToEdit.setParticipantes(participantes);
        } else {
            reuniaoToEdit.setParticipantes(null); // Limpa participantes se o campo estiver vazio
        }

        if (!ata.isEmpty()) {
            reuniaoToEdit.setAta(ata);
        } else {
            reuniaoToEdit.setAta(null); // Limpa ata se o campo estiver vazio
        }

        // 4. Chamar o serviço em uma nova thread
        editButton.setDisable(true); // Desabilita o botão de salvar enquanto salva
        statusLabel.setText("Salvando alterações...");
        statusLabel.setVisible(true);
        statusLabel.setManaged(true);

        new Thread(() -> {
            try {
                ReuniaoDTO reuniaoAtualizada = reuniaoService.updateReuniao(reuniaoToEdit.getId(), reuniaoToEdit);
                Platform.runLater(() -> {
                    showAlert(AlertType.INFORMATION, "Sucesso", "Reunião Atualizada", "A reunião '" + reuniaoAtualizada.getPauta() + "' foi atualizada com sucesso!");
                    setEditable(false); // Volta para modo de visualização
                    updateButtonVisibility(false); // Atualiza visibilidade dos botões
                    // Opcional: Atualizar reuniaoToEdit com reuniaoAtualizada se o backend retornar dados mais completos
                    this.reuniaoToEdit = reuniaoAtualizada;
                    fillFormWithReuniaoData(); // Recarrega os dados para garantir consistência
                });
            } catch (IOException e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro de Atualização", "Falha ao atualizar reunião", "Não foi possível atualizar a reunião. Detalhes: " + e.getMessage());
                    e.printStackTrace();
                });
            } catch (Exception e) {
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Erro Inesperado", "Ocorreu um erro inesperado.", "Detalhes: " + e.getMessage());
                    e.printStackTrace();
                });
            } finally {
                Platform.runLater(() -> {
                    editButton.setDisable(false);
                    statusLabel.setVisible(false);
                    statusLabel.setManaged(false);
                });
            }
        }).start();
    }

    @FXML // Adicionando a anotação que faltava
    private void handleEndReuniao() {
        if (reuniaoToEdit == null || reuniaoToEdit.getId() == null) {
            showAlert(AlertType.ERROR, "Erro", "Reunião não selecionada", "Nenhuma reunião para encerrar.");
            return;
        }

        Alert confirmAlert = new Alert(AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirmar Encerramento");
        confirmAlert.setHeaderText("Encerrar Reunião");
        confirmAlert.setContentText("Tem certeza que deseja encerrar a reunião: " + reuniaoToEdit.getPauta() + "?");

        Optional<ButtonType> result = confirmAlert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            endButton.setDisable(true);
            statusLabel.setText("Encerrando reunião...");
            statusLabel.setVisible(true);
            statusLabel.setManaged(true);

            new Thread(() -> {
                try {
                    ReuniaoDTO reuniaoEncerrada = reuniaoService.endReuniao(reuniaoToEdit.getId());
                    Platform.runLater(() -> {
                        showAlert(AlertType.INFORMATION, "Sucesso", "Reunião Encerrada", "A reunião '" + reuniaoEncerrada.getPauta() + "' foi encerrada com sucesso!");
                        MainApp.setRoot("ReunioesView"); // Voltar para a lista de reuniões
                    });
                } catch (IOException e) {
                    Platform.runLater(() -> {
                        showAlert(AlertType.ERROR, "Erro ao Encerrar", "Falha ao encerrar reunião", "Não foi possível encerrar a reunião. Detalhes: " + e.getMessage());
                        e.printStackTrace();
                    });
                } finally {
                    Platform.runLater(() -> {
                        endButton.setDisable(false);
                        statusLabel.setVisible(false);
                        statusLabel.setManaged(false);
                    });
                }
            }).start();
        }
    }

    @FXML
    private void handleDeleteReuniao() {
        if (reuniaoToEdit == null || reuniaoToEdit.getId() == null) {
            showAlert(AlertType.ERROR, "Erro", "Reunião não selecionada", "Nenhuma reunião para excluir.");
            return;
        }

        Alert confirmAlert = new Alert(AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirmar Exclusão");
        confirmAlert.setHeaderText("Excluir Reunião");
        confirmAlert.setContentText("Tem certeza que deseja excluir a reunião: " + reuniaoToEdit.getPauta() + "? Esta ação é irreversível.");

        Optional<ButtonType> result = confirmAlert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            deleteButton.setDisable(true);
            statusLabel.setText("Excluindo reunião...");
            statusLabel.setVisible(true);
            statusLabel.setManaged(true);

            new Thread(() -> {
                try {
                    reuniaoService.deleteReuniao(reuniaoToEdit.getId());
                    Platform.runLater(() -> {
                        showAlert(AlertType.INFORMATION, "Sucesso", "Reunião Excluída", "A reunião '" + reuniaoToEdit.getPauta() + "' foi excluída com sucesso!");
                        MainApp.setRoot("ReunioesView"); // Voltar para a lista de reuniões
                    });
                } catch (IOException e) {
                    Platform.runLater(() -> {
                        showAlert(AlertType.ERROR, "Erro ao Excluir", "Falha ao excluir reunião", "Não foi possível excluir a reunião. Detalhes: " + e.getMessage());
                        e.printStackTrace();
                    });
                } finally {
                    Platform.runLater(() -> {
                        deleteButton.setDisable(false);
                        statusLabel.setVisible(false);
                        statusLabel.setManaged(false);
                    });
                }
            }).start();
        }
    }

    // Método para popular a seção de tarefas
    private void populateTasks(List<Tarefa> tasks) {
        tasksContainer.getChildren().clear(); // Limpa tarefas existentes
        if (tasks != null && !tasks.isEmpty()) {
            for (Tarefa task : tasks) {
                HBox taskItem = new HBox(10); // Espaçamento de 10px
                taskItem.getStyleClass().add("task-item");
                taskItem.setAlignment(javafx.geometry.Pos.CENTER_LEFT);

                // Ícone (carrega se existir, senão segue sem ícone)
                ImageView icon = null;
                try {
                    InputStream iconStream = getClass().getResourceAsStream("/com/smartmeeting/frontend/icons/task-icon.png");
                    if (iconStream == null) {
                        // Tenta carregar um ícone de fallback se o principal não for encontrado
                        iconStream = getClass().getResourceAsStream("/com/smartmeeting/frontend/icons/default-task-icon.png");
                    }

                    if (iconStream != null) {
                        icon = new ImageView(new Image(iconStream));
                        icon.setFitHeight(16);
                        icon.setFitWidth(16);
                    }
                } catch (Exception e) {
                    // O erro de carregamento é ignorado silenciosamente para não quebrar a UI
                }

                Label taskLabel = new Label(task.getDescricao());
                taskLabel.getStyleClass().add("task-text");
                if (task.isConcluida()) {
                    taskLabel.setStyle("-fx-strikethrough: true; -fx-text-fill: #888;"); // Estilo para tarefa concluída
                }

                if (icon != null) {
                    taskItem.getChildren().addAll(icon, taskLabel);
                } else {
                    taskItem.getChildren().add(taskLabel);
                }
                tasksContainer.getChildren().add(taskItem);
            }
        } else {
            Label noTasksLabel = new Label("Nenhuma tarefa para esta reunião.");
            noTasksLabel.getStyleClass().add("task-text");
            tasksContainer.getChildren().add(noTasksLabel);
        }
    }

    private void showAlert(AlertType alertType, String title, String header, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        alert.showAndWait();
    }
}
