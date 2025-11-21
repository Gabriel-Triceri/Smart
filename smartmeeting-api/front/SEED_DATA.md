# Sistema de Importação Automática de Dados (Seed Data)

## 📋 Descrição

Este sistema importa automaticamente **5 registros em cada tabela** do banco de dados quando você inicia o programa pela primeira vez.

## 🎯 O que é importado?

### 1. **Salas** (5 registros)
- Sala Executiva A (Andar 10)
- Sala de Reuniões B (Andar 8)
- Sala de Brainstorm (Andar 7)
- Auditório Principal (Térreo)
- Sala de Treinamento (Andar 5)

### 2. **Reuniões** (5 registros)
- Sprint Planning - Q1 2025
- Revisão de Arquitetura do Sistema
- Alinhamento de Produto
- Workshop de Inovação
- Reunião de Status do Projeto

### 3. **Tarefas** (5 registros)
- Preparar documentação técnica
- Revisar protótipos de UI
- Implementar feedback do cliente
- Configurar ambiente de testes
- Atualizar roadmap do produto

## 🔄 Como funciona?

1. **Primeira inicialização**: Quando você inicia o programa pela primeira vez, o sistema:
   - Verifica se já existem dados no banco
   - Se não houver dados, importa automaticamente os 5 registros de cada tabela
   - Salva no `localStorage` que a importação foi executada

2. **Inicializações posteriores**: 
   - O sistema verifica o `localStorage`
   - Se já foi executado antes, **não importa novamente**
   - Isso evita duplicação de dados

## 🛠️ Onde está configurado?

- **Arquivo de seed**: `src/services/seedData.ts`
- **Integração na app**: `src/main.tsx` (linha 28-31)

## 🔍 Logs no console

Ao iniciar o programa, você verá logs como:

```
🔍 Verificando dados existentes...
📦 Nenhum dado encontrado. Iniciando importação...
🚀 Iniciando importação de dados...
📍 Importando salas...
✅ Sala "Sala Executiva A" importada com sucesso
✅ Sala "Sala de Reuniões B" importada com sucesso
...
📅 Importando reuniões...
✅ Reunião "Sprint Planning - Q1 2025" importada com sucesso
...
✅ Importando tarefas...
✅ Tarefa "Preparar documentação técnica" importada com sucesso
...
🎉 Importação de dados concluída com sucesso!
📊 Resumo: 5 salas, 5 reuniões e 5 tarefas importadas
```

## 🔧 Como resetar os dados?

Se você quiser que o sistema importe novamente os dados:

1. Limpe o `localStorage` no navegador:
   ```javascript
   localStorage.removeItem('smartmeeting-seed-executado');
   ```
2. Recarregue a página

Ou, se quiser limpar tudo e começar do zero:
1. Limpe o banco de dados H2
2. Limpe o `localStorage` do navegador
3. Reinicie a aplicação

## ⚠️ Importante

- **Os dados SÃO enviados para o banco de dados real** através da API do backend
- **NÃO são dados mockados** - são registros reais persistidos no banco H2
- A importação só acontece se não houver dados existentes no sistema

## 📝 Modificando os dados de seed

Para modificar os dados que são importados, edite:
- `salasParaImportar` - linha 17
- `participantesParaImportar` - linha 66  
- Funções `gerarReunioes()` e `gerarTarefas()` - linhas 123 e 160

no arquivo `src/services/seedData.ts`
