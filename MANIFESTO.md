Manifesto do Projeto: Painel de Pagamentos
Versão: 4.0 (Pronto para Entrega)
Data: 21 de Julho de 2025

1. Propósito do Projeto
O objetivo deste sistema é fornecer uma interface web (painel de controle) completa para a geração e gerenciamento de cobranças via Mercado Pago. O sistema foi desenvolvido como uma plataforma multi-usuário segura, onde cada usuário cadastrado possui acesso exclusivo e privado ao seu próprio conjunto de clientes e registros de pagamento.

O painel oferece um fluxo de trabalho completo, incluindo:

Cadastro e gerenciamento de clientes (CRUD).

Geração de pagamentos vinculados a clientes.

Rastreio automático de status (Aprovado, Pendente, Falhou) através de webhooks do Mercado Pago.

Funcionalidades manuais de gestão (Baixar, Cancelar pagamento).

Visualização de dados em tempo real com funcionalidades avançadas de busca, filtro e paginação.

Um sistema de autenticação seguro para proteger o acesso aos dados.

2. Visão Geral da Arquitetura
O projeto utiliza uma arquitetura moderna que separa o frontend (interface do usuário) do backend (lógica de negócio).

Frontend: Uma aplicação React (Single Page Application) construída com Vite e react-router-dom para navegação. É responsável por toda a interface do usuário e não contém chaves de API secretas.

Backend: Funções "serverless" na plataforma Google Firebase (Cloud Functions). É o cérebro do sistema, responsável por se comunicar de forma segura com a API do Mercado Pago e receber webhooks.

Banco de Dados: Google Firestore, um banco de dados NoSQL em tempo real, usado para persistir os registros de clientes e pagamentos.

Autenticação: Firebase Authentication gerencia todo o ciclo de vida do usuário (cadastro, login, logout) e atua como o "porteiro" da aplicação, garantindo o acesso seguro.

3. Tecnologias Utilizadas
Frontend: React, Vite, JavaScript, CSS Modules, React Router DOM

Backend: Node.js (via Firebase Functions)

Banco de Dados: Google Firestore

Plataforma "Backend-as-a-Service": Google Firebase (Functions, Firestore, Authentication)

Gateway de Pagamento: Mercado Pago API

4. Estrutura de Pastas e Arquivos Final
sistema-pagamentos/
├── functions/            # Código do Backend (Node.js)
│   └── index.js
│   └── package.json
│
├── public/               # Ícones e arquivos estáticos
│   └── pwa-192x192.png
│   └── pwa-512x512.png
│
├── src/                  # Código do Frontend (React)
│   ├── components/       # Componentes reutilizáveis da UI
│   │   ├── AuthForm.jsx
│   │   ├── ClientFormModal.jsx
│   │   ├── DescriptionModal.jsx
│   │   ├── MainLayout.jsx
│   │   ├── Navbar.jsx
│   │   ├── PaymentDetailsModal.jsx
│   │   ├── PaymentModal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ReloadPrompt.jsx
│   │
│   ├── context/          # Contextos Globais do React
│   │   └── AuthContext.jsx
│   │
│   ├── pages/            # Componentes que representam páginas inteiras
│   │   ├── ClientsPage.jsx
│   │   ├── ClientDetailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   │
│   ├── App.css
│   ├── App.jsx           # Componente principal que gerencia as rotas
│   ├── firebase.js       # Configuração e inicialização do Firebase SDK
│   └── main.jsx          # Ponto de entrada da aplicação React
│
├── .env.local            # Chaves de configuração do frontend
├── .firebaserc           # Vincula a pasta a um projeto Firebase
├── firebase.json         # Configurações de deploy do Firebase
├── firestore.indexes.json
├── firestore.rules       # Regras de segurança do banco de dados
├── index.html
├── package.json          # Dependências do frontend
└── vite.config.js        # Configurações do Vite e do PWA
5. Etapas Concluídas (Status Atual)
O sistema está com seu ciclo de desenvolvimento principal concluído.

Versão 1.0 (Base Funcional)
[x] Setup do Ambiente: Configuração inicial com React/Vite e Firebase.

[x] Geração de Pagamento Simples: Criação da Cloud Function para gerar links do Mercado Pago.

[x] Atualização Automática de Status: Implementação de Webhook para receber notificações do Mercado Pago.

Versão 2.0 (Painel Avançado)
[x] Reestruturação com Rotas: Aplicação transformada em multi-página com React Router.

[x] Gerenciamento de Clientes (CRUD): Página dedicada para Criar, Ler, Atualizar e Deletar clientes.

[x] Refatoração da Criação de Pagamentos: Fluxo alterado para um modal que vincula pagamentos a clientes.

[x] Layout Moderno (Cards): A visualização de pagamentos foi transformada em um layout de cards responsivo.

[x] Filtros e Paginação: Implementação de filtros dinâmicos e sistema de "Carregar Mais".

[x] Detalhes por Cliente (Extrato): Criação de uma página de detalhes para cada cliente com seu histórico e saldo.

[x] Funcionalidades de Gestão: Adicionadas as opções de "Baixar" e "Cancelar" pagamentos manualmente.

Versão 3.0 (Segurança e Finalização)
[x] Implementação de Autenticação: Adicionado fluxo completo de Cadastro, Login/Logout e sessão persistente.

[x] Proteção de Rotas: Implementado um sistema que redireciona usuários não logados para a página de login.

[x] Vinculação de Dados ao Usuário: Cada novo cliente e pagamento agora é "carimbado" com o ID do seu criador.

[x] Regras de Segurança do Firestore: As regras do banco de dados foram reescritas para garantir que um usuário só possa acessar os dados que ele mesmo criou.

[x] Progressive Web App (PWA): O sistema agora pode ser "instalado" em desktops e celulares, com um mecanismo de atualização para novas versões.

6. Próximas Etapas
[ ] Migração para o Ambiente do Cliente: O próximo passo planejado é transferir e configurar toda a aplicação para rodar no projeto Firebase do cliente final. Isso envolve:

[ ] Fazer uma cópia do código-fonte.

[ ] Vincular a cópia ao novo projeto Firebase do cliente.

[ ] Atualizar todas as chaves de configuração do frontend (.env.local) e backend (functions config).

[ ] Configurar o banco de dados do cliente (Regras de Segurança e Índices).

[ ] Fazer o deploy completo da aplicação (Functions e Hosting) no novo ambiente.

[ ] Configurar as credenciais de produção do Mercado Pago do cliente.

[ ] Publicação e Treinamento:

[ ] Publicar a aplicação React em sua URL de produção final no Firebase Hosting.

[ ] Realizar o treinamento com o cliente para a criação do usuário administrador e uso do sistema.