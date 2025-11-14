# SmartMeeting - Dashboard Executivo

Dashboard executivo moderno e responsivo para o sistema SmartMeeting, desenvolvido com React, TypeScript e Tailwind CSS.

![Dashboard Preview](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=SmartMeeting+Dashboard)

## 🚀 Funcionalidades

### 📊 Métricas Principais
- **Total de Reuniões**: Visualize o número total de reuniões agendadas
- **Taxa de Presença**: Monitore a taxa média de participação
- **Salas em Uso**: Acompanhe a ocupação das salas em tempo real
- **Tempo Médio**: Analise a duração média das reuniões

### 📈 Gráficos Interativos
- **Timeline de Reuniões**: Gráfico de área mostrando evolução de reuniões e participantes
- **Uso de Salas**: Gráfico de pizza com distribuição de utilização por sala
- **Produtividade**: Gráfico de barras com taxa de produtividade diária

### 🎯 Widgets de Status
- **Reuniões do Dia**: Lista completa das reuniões agendadas para hoje
- **Próximas Reuniões**: Calendário das próximas reuniões
- **Alertas Pendentes**: Notificações e avisos importantes

### 🎨 Design Moderno
- ✨ **Dark Mode**: Alternância suave entre tema claro e escuro
- 📱 **Layout Responsivo**: Otimizado para desktop, tablet e mobile
- 🎭 **Animações Suaves**: Transições e efeitos visuais elegantes
- 🎨 **Ícones SVG**: Biblioteca Lucide React para ícones profissionais

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework JavaScript para UI
- **TypeScript**: Tipagem estática para maior segurança
- **Vite**: Build tool rápido e moderno
- **Tailwind CSS**: Framework CSS utilitário
- **Recharts**: Biblioteca de gráficos para React
- **Lucide React**: Biblioteca de ícones SVG
- **Axios**: Cliente HTTP para chamadas API

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos

1. **Clone o repositório ou extraia os arquivos**

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com a URL da sua API:
```env
VITE_API_URL=http://localhost:8080/api
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

O dashboard estará disponível em `http://localhost:3000`

## 🔌 Integração com API

O dashboard espera os seguintes endpoints:

### GET /dashboard/estatisticas-gerais
```typescript
{
  totalReunioes: number;
  taxaPresenca: number;
  salasEmUso: number;
  totalSalas: number;
  reunioesHoje: number;
  proximasReunioes: number;
  alertasPendentes: number;
  mediaParticipantes: number;
  tempoMedioReuniao: number;
}
```

### GET /dashboard/uso-salas
```typescript
[
  {
    id: string;
    nome: string;
    utilizacao: number;
    totalReunioes: number;
    capacidade: number;
    status: 'disponivel' | 'ocupada' | 'manutencao';
  }
]
```

### GET /dashboard/metricas-reunioes
```typescript
[
  {
    data: string; // formato: DD/MM
    reunioes: number;
    participantes: number;
    presencas: number;
  }
]
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── Dashboard.tsx         # Componente principal
│   ├── MetricCard.tsx        # Card de métricas
│   ├── Charts.tsx            # Gráficos (Timeline, Pizza, Barras)
│   ├── Widgets.tsx           # Widgets de status
│   └── ThemeToggle.tsx       # Toggle de tema
├── contexts/
│   └── ThemeContext.tsx      # Contexto de tema
├── services/
│   └── api.ts                # Serviço de API
├── types/
│   └── dashboard.ts          # Tipos TypeScript
├── App.tsx                   # Componente raiz
├── main.tsx                  # Entry point
└── index.css                 # Estilos globais
```

## 🎨 Customização

### Cores
Edite o arquivo `tailwind.config.js` para personalizar as cores:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9', // Cor principal
        // ...
      },
    },
  },
}
```

### Animações
As animações estão definidas em `tailwind.config.js` e podem ser customizadas:

```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.5s ease-out',
}
```

## 📱 Responsividade

O dashboard é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🌙 Dark Mode

O dark mode é implementado usando Tailwind CSS e contexto React:
- Preferência salva no `localStorage`
- Transições suaves entre temas
- Toggle no header do dashboard

## 🔄 Atualização Automática

O dashboard atualiza automaticamente a cada 5 minutos. Você pode modificar o intervalo em `Dashboard.tsx`:

```typescript
const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
```

## 📊 Dados Mock

Para desenvolvimento, o dashboard usa dados mock. Substitua as chamadas em `src/services/api.ts` pelos seus endpoints reais:

```typescript
// Substituir
const mockData = { ... };

// Por
const data = await dashboardService.getDashboardCompleto();
```

## 🚀 Build para Produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados serão gerados na pasta `dist/`

## 📄 Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Build de produção
- `npm run preview`: Preview do build de produção
- `npm run lint`: Executa linter

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fork o projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**MiniMax Agent**

## 🐛 Reportar Problemas

Encontrou um bug? Abra uma issue com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)

## 📞 Suporte

Para dúvidas ou suporte:
- Email: suporte@smartmeeting.com
- Issues: GitHub Issues

---

**Feito com ❤️ usando React + TypeScript + Tailwind CSS**
