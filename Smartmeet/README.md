# SmartMeeting - Sistema de Gestão de Reuniões

Sistema completo para gestão de reuniões, salas e tarefas desenvolvido com Next.js 14 e React, seguindo boas práticas de desenvolvimento e arquitetura limpa.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [API Reference](#api-reference)

## 🎯 Visão Geral

O SmartMeeting é uma aplicação web moderna para gestão de reuniões corporativas, oferecendo funcionalidades completas para:

- **Autenticação de usuários** com sistema de login seguro
- **Gestão de salas** com controle de disponibilidade e recursos
- **Agendamento de reuniões** com participantes e notificações
- **Controle de tarefas** vinculadas às reuniões
- **Dashboard interativo** com métricas e visão geral

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS v4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Biblioteca de ícones

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **pnpm** - Gerenciador de pacotes

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas do Next.js (App Router)
│   ├── (auth)/             # Grupo de rotas para autenticação
│   │   └── login/          # Página de login
│   ├── (dashboard)/        # Grupo de rotas para o dashboard
│   │   ├── dashboard/      # Página principal do dashboard
│   │   ├── reunioes/       # Gestão de reuniões
│   │   ├── salas/          # Gestão de salas
│   │   └── tarefas/        # Gestão de tarefas
│   ├── api/                # Rotas de API do Next.js
│   │   ├── auth/           # Autenticação
│   │   ├── pessoas/        # CRUD de pessoas
│   │   ├── reunioes/       # CRUD de reuniões
│   │   ├── salas/          # CRUD de salas
│   │   └── tarefas/        # CRUD de tarefas
│   ├── layout.tsx          # Layout principal da aplicação
│   ├── globals.css         # Estilos globais
│   └── page.tsx            # Página inicial (redirecionamento)
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes de UI (shadcn/ui)
│   └── layout/             # Componentes de layout
├── context/                # Contextos React
├── hooks/                  # Custom hooks
├── services/               # Serviços para chamadas de API
├── styles/                 # Estilos adicionais
├── utils/                  # Funções utilitárias e constantes
└── lib/                    # Configurações e utilitários
```

### Organização por Responsabilidade

#### 🎨 Componentes (`src/components/`)
- **UI Components**: Componentes básicos reutilizáveis (botões, inputs, cards)
- **Layout Components**: Componentes de estrutura (header, sidebar, layout do dashboard)

#### 🔧 Serviços (`src/services/`)
- **authService**: Gerenciamento de autenticação e tokens
- **reunioesService**: Operações CRUD para reuniões
- **salasService**: Operações CRUD para salas
- **tarefasService**: Operações CRUD para tarefas
- **pessoasService**: Operações CRUD para usuários

#### 🎣 Hooks (`src/hooks/`)
- **useAuth**: Hook para gerenciamento de estado de autenticação
- **useLocalStorage**: Hook para persistência local
- **useApi**: Hook genérico para chamadas de API
- **useForm**: Hook para gerenciamento de formulários

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Passos de Instalação

1. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

2. **Execute o projeto em desenvolvimento**
```bash
pnpm dev
# ou
npm run dev
```

3. **Acesse a aplicação**
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm build        # Gera build de produção
pnpm start        # Inicia servidor de produção
pnpm lint         # Executa linting do código
```

## 🎯 Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Gerenciamento de tokens JWT
- Proteção de rotas privadas
- Logout automático

### 📊 Dashboard
- Visão geral das atividades
- Métricas em tempo real:
  - Reuniões agendadas
  - Tarefas pendentes
  - Salas disponíveis
- Cards informativos com próximas reuniões e tarefas

### 🏢 Gestão de Salas
- Cadastro de salas com informações detalhadas
- Controle de capacidade e recursos
- Status de disponibilidade (Livre, Ocupada, Manutenção)
- Busca de salas disponíveis por período

### 📅 Gestão de Reuniões
- Agendamento de reuniões
- Seleção de participantes
- Vinculação com salas
- Controle de status (Agendada, Em Andamento, Finalizada, Cancelada)

### ✅ Gestão de Tarefas
- Criação de tarefas vinculadas a reuniões
- Controle de prioridade e status
- Atribuição de responsáveis
- Datas de vencimento

### 👥 Gestão de Pessoas
- Cadastro de usuários
- Organização por departamentos
- Controle de status (Ativo, Inativo)
- Perfis com informações de contato

## 🏗️ Arquitetura

### Padrões Arquiteturais

#### 📱 App Router (Next.js 14)
O projeto utiliza o novo App Router do Next.js 14, que oferece:
- Roteamento baseado em arquivos
- Layouts aninhados
- Grupos de rotas para organização
- Server Components por padrão

#### 🔄 Separação de Responsabilidades
- **Componentes**: Apenas UI e interação do usuário
- **Serviços**: Lógica de negócio e comunicação com APIs
- **Hooks**: Estado e efeitos colaterais reutilizáveis
- **Utils**: Funções auxiliares puras

#### 🎯 Tipagem com TypeScript
- Interfaces bem definidas para todas as entidades
- Tipagem de props de componentes
- Tipagem de respostas de API
- Validação em tempo de compilação

## 📖 Guia de Desenvolvimento

### 🎨 Convenções de Código

#### Nomenclatura
- **Componentes**: PascalCase (`UserCard.tsx`)
- **Funções e variáveis**: camelCase (`handleLogin`, `userToken`)
- **Constantes**: MAIÚSCULAS (`API_URL`)
- **Interfaces**: PascalCase com prefixo descritivo (`CreateReuniao`)

#### Estrutura de Arquivos
- Um componente por arquivo
- Exportação default para componentes principais
- Exportação nomeada para utilitários e tipos

#### Comentários
- JSDoc para funções públicas
- Comentários inline para lógica complexa
- TODO para melhorias futuras

### 🔧 Boas Práticas Implementadas

#### ✅ Componentes
- Componentes funcionais com hooks
- Props tipadas com TypeScript
- Separação entre componentes de UI e lógica
- Reutilização através de composição

#### ✅ Estado
- Estado local com useState para UI
- Context API para estado global (autenticação)
- Custom hooks para lógica reutilizável

#### ✅ Performance
- Lazy loading de componentes quando necessário
- Memoização de cálculos custosos
- Otimização de re-renders

#### ✅ Acessibilidade
- Componentes Radix UI acessíveis
- Labels apropriados em formulários
- Navegação por teclado
- Contraste adequado de cores

## 🔌 API Reference

### Autenticação

#### POST `/api/auth/login`
Realiza login do usuário.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "1",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário"
  }
}
```

### Reuniões

#### GET `/api/reunioes`
Lista todas as reuniões.

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/reunioes`
Cria uma nova reunião.

#### PUT `/api/reunioes/[id]`
Atualiza uma reunião existente.

#### DELETE `/api/reunioes/[id]`
Remove uma reunião.

### Salas

#### GET `/api/salas`
Lista todas as salas.

#### GET `/api/salas/available`
Lista salas disponíveis em um período.

**Query Parameters:**
- `dataInicio`: Data/hora de início (ISO 8601)
- `dataFim`: Data/hora de fim (ISO 8601)

### Tarefas

#### GET `/api/tarefas`
Lista todas as tarefas.

**Query Parameters:**
- `status`: Filtrar por status
- `reuniaoId`: Filtrar por reunião

### Pessoas

#### GET `/api/pessoas`
Lista todas as pessoas.

**Query Parameters:**
- `departamento`: Filtrar por departamento
- `status`: Filtrar por status

---

**Projeto reorganizado seguindo boas práticas de desenvolvimento React/Next.js**
