#!/bin/bash

# Script de setup automatizado para SmartMeeting Dashboard
# Execute com: bash setup.sh

set -e

echo "🚀 SmartMeeting Dashboard - Setup Automatizado"
echo "================================================"
echo ""

# Verificar Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 16+ primeiro."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js instalado: $NODE_VERSION"
echo ""

# Verificar npm
echo "📋 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm instalado: $NPM_VERSION"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️  Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo "⚠️  IMPORTANTE: Configure a URL da API no arquivo .env"
else
    echo "ℹ️  Arquivo .env já existe"
fi
echo ""

# Resumo
echo "================================================"
echo "✨ Setup concluído com sucesso!"
echo "================================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Configure a URL da API no arquivo .env:"
echo "   VITE_API_URL=http://localhost:8080/api"
echo ""
echo "2. Inicie o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""
echo "3. Acesse o dashboard em:"
echo "   http://localhost:3000"
echo ""
echo "================================================"
echo ""
echo "📚 Documentação completa: README.md"
echo "🐛 Problemas? Veja: INSTALACAO.md"
echo ""
echo "Desenvolvido por MiniMax Agent"
echo ""
