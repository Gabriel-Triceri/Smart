package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis tipos de notificação no sistema.
 */
public enum TipoNotificacao {
    EMAIL("Notificação por e-mail", true),
    CONSOLE("Notificação no console da aplicação", false),
    PUSH("Notificação push para dispositivos móveis", true);
    
    private final String descricao;
    private final boolean envioExterno;
    
    TipoNotificacao(String descricao, boolean envioExterno) {
        this.descricao = descricao;
        this.envioExterno = envioExterno;
    }
    
    /**
     * Retorna a descrição do tipo de notificação
     * @return String contendo a descrição do tipo
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se a notificação é enviada para um sistema externo
     * @return true se a notificação for enviada externamente, false caso contrário
     */
    public boolean isEnvioExterno() {
        return envioExterno;
    }
    
    /**
     * Verifica se a notificação é do tipo e-mail
     * @return true se a notificação for do tipo e-mail, false caso contrário
     */
    public boolean isEmail() {
        return this == EMAIL;
    }
    
    /**
     * Verifica se a notificação é do tipo push
     * @return true se a notificação for do tipo push, false caso contrário
     */
    public boolean isPush() {
        return this == PUSH;
    }
}
