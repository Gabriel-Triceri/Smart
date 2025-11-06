package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis tipos de acesso no sistema.
 */
public enum TipoAcesso {
    TOTAL("Acesso total ao sistema", true, true, true),
    LEITURA_ESCRITA("Acesso de leitura e escrita", true, true, false),
    SOMENTE_LEITURA("Acesso somente de leitura", true, false, false),
    RESTRITO("Acesso restrito a funcionalidades específicas", false, false, false);
    
    private final String descricao;
    private final boolean podeLer;
    private final boolean podeEscrever;
    private final boolean podeAdministrar;
    
    TipoAcesso(String descricao, boolean podeLer, boolean podeEscrever, boolean podeAdministrar) {
        this.descricao = descricao;
        this.podeLer = podeLer;
        this.podeEscrever = podeEscrever;
        this.podeAdministrar = podeAdministrar;
    }
    
    /**
     * Retorna a descrição do tipo de acesso
     * @return String contendo a descrição do tipo
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se o tipo de acesso permite leitura
     * @return true se o acesso permitir leitura, false caso contrário
     */
    public boolean podeLer() {
        return podeLer;
    }
    
    /**
     * Verifica se o tipo de acesso permite escrita
     * @return true se o acesso permitir escrita, false caso contrário
     */
    public boolean podeEscrever() {
        return podeEscrever;
    }
    
    /**
     * Verifica se o tipo de acesso permite administração
     * @return true se o acesso permitir administração, false caso contrário
     */
    public boolean podeAdministrar() {
        return podeAdministrar;
    }
    
    /**
     * Verifica se o tipo de acesso é total
     * @return true se o acesso for total, false caso contrário
     */
    public boolean isAcessoTotal() {
        return this == TOTAL;
    }
}
