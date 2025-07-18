Manifesto do Projeto: Sistema de Pagamentos
Versão: 3.0 (Segurança e Multi-Usuário)
Data: 16 de Julho de 2025

1. Propósito do Projeto
O objetivo deste sistema é criar uma interface web (painel) para a geração e o gerenciamento de cobranças de pagamento através da API do Mercado Pago. O sistema evoluiu para uma plataforma multi-usuário segura, onde cada usuário tem acesso exclusivo aos seus próprios clientes e pagamentos.

O painel permite o cadastro de clientes, a vinculação de pagamentos, o rastreio automático de status via webhooks e a visualização de dados em tempo real com funcionalidades avançadas de busca, filtro e paginação.

2. Visão Geral da Arquitetura
O projeto é construído sobre uma arquitetura moderna separando o frontend do backend.

Frontend: Uma aplicação React (Single Page Application) construída com Vite e react-router-dom para navegação. É responsável por toda a interface do usuário e não contém nenhuma chave secreta.

Backend: Funções "serverless" na plataforma Google Firebase (Cloud Functions). É o cérebro do sistema, responsável por se comunicar de forma segura com a API do Mercado Pago e receber webhooks.

Banco de Dados: Google Firestore, usado para persistir os registros de clientes e pagamentos.

Autenticação: Firebase Authentication gerencia todo o ciclo de vida do usuário (cadastro, login, logout) e atua como o "porteiro" da aplicação.

3. Tecnologias Utilizadas
Frontend: React, Vite, JavaScript, CSS Modules, React Router DOM

Backend: Node.js (via Firebase Functions)

Banco de Dados: Google Firestore

Plataforma "Backend-as-a-Service": Google Firebase (Functions, Firestore, Authentication)

Gateway de Pagamento: Mercado Pago API

4. Estrutura de Pastas e Arquivos Atualizada
sistema-pagamentos/
├── functions/            # Código do Backend (Node.js)
│   └── index.js
│   └── package.json
│
├── src/                  # Código do Frontend (React)
│   ├── components/       # Componentes reutilizáveis da UI
│   │   ├── AuthForm.jsx
│   │   ├── ClientFormModal.jsx
│   │   ├── DescriptionModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── PaymentDetailsModal.jsx
│   │   ├── PaymentModal.jsx
│   │   └── ProtectedRoute.jsx
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
├── .env.local
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── index.html
└── package.json
5. Etapas Concluídas (Status Atual)
Versão 1.0 (Base Funcional)
[x] Setup do Ambiente: Configuração inicial com React/Vite e Firebase.

[x] Geração de Pagamento Simples: Criação da Cloud Function para gerar links do Mercado Pago.

[x] Atualização Automática de Status: Implementação de Webhook para receber notificações do Mercado Pago.

Versão 2.0 (Painel Avançado)
[x] Reestruturação com Rotas: Aplicação transformada em multi-página com React Router.

[x] Gerenciamento de Clientes (CRUD): Página dedicada para Criar, Ler, Atualizar e Deletar clientes.

[x] Refatoração da Criação de Pagamentos: Fluxo alterado para um modal que vincula pagamentos a clientes.

[x] Tabela de Pagamentos Avançada: Visualização transformada em uma tabela de dados interativa.

[x] Filtros, Busca e Paginação: Implementação de filtros dinâmicos e sistema de "Carregar Mais".

[x] Detalhes por Cliente (Extrato): Criação de uma página de detalhes para cada cliente com seu histórico e saldo.

Versão 3.0 (Segurança e Multi-Usuário)
[x] Implementação de Autenticação: Adicionado fluxo completo de Cadastro e Login com Email e Senha.

[x] Gestão de Sessão: Criação de um AuthContext para gerenciar o estado do usuário logado em toda a aplicação.

[x] Proteção de Rotas: Implementado um sistema que redireciona usuários não logados para a página de login.

[x] Vinculação de Dados ao Usuário: Cada novo cliente e pagamento agora é "carimbado" com o ID do seu criador.

[x] Regras de Segurança do Firestore: As regras do banco de dados foram reescritas para garantir que um usuário só possa acessar os dados que ele mesmo criou.

6. Próximas Etapas e Melhorias Futuras
O sistema está com sua funcionalidade principal 100% completa e segura. As próximas etapas são focadas em aprimoramento da interface e publicação.

[ ] Melhoria de Layout e Responsividade (Próxima Etapa Focada):

[ ] Revisar e refinar o layout de todas as páginas para garantir uma experiência de usuário (UX) coesa e profissional.

[ ] Garantir que todos os componentes (tabelas, modais, formulários) sejam totalmente responsivos e fáceis de usar em dispositivos móveis.

[ ] Deploy e Produção:

[ ] Publicar a aplicação React em uma plataforma de hospedagem como Vercel ou Netlify para que possa ser acessada de qualquer lugar.

[ ] Novas Funcionalidades (Opcional):

[ ] KPIs e Gráficos: Adicionar um painel visual com gráficos mostrando o total arrecadado por mês, pagamentos por status, etc.

[ ] Exportação de Dados: Criar uma função para exportar a lista de pagamentos filtrada para um arquivo CSV ou Excel.




Passo 1: Obter sua Chave Real (Access Token de Produção)
Primeiro, você precisa pegar sua chave "de verdade" no painel do Mercado Pago.

Acesse o painel de desenvolvedor do Mercado Pago: https://www.mercadopago.com.br/developers/panel

Clique em "Suas aplicações" no menu esquerdo e selecione a sua aplicação.

Dentro da sua aplicação, clique na aba "Credenciais de Produção".

Copie o seu Access Token. É a chave mais longa, que geralmente começa com APP_USR-....

Passo 2: Atualizar a Chave no Ambiente do Firebase
Agora, vamos usar o terminal para substituir a chave de teste antiga pela nova chave de produção que você acabou de copiar.

Abra o seu terminal e navegue até a pasta functions do seu projeto.

Execute o seguinte comando, colando a sua chave de produção no lugar de SUA_CHAVE_REAL_DE_PRODUÇÃO_AQUI. É importante usar as aspas.

Bash

firebase functions:config:set mercadopago.token="SUA_CHAVE_REAL_DE_PRODUÇÃO_AQUI"
Aperte Enter. O terminal deve confirmar que a configuração foi atualizada (Functions config updated.). Este comando sobrescreve a chave antiga de forma segura nos servidores do Google.

Passo 3: Publicar a Alteração (Deploy)
Para que a sua função no ar comece a usar a nova chave, você precisa fazer o deploy novamente. Isso força a função a recarregar suas configurações.

Ainda no terminal, dentro da pasta functions, rode o comando:

Bash

firebase deploy --only functions
Aguarde o processo ser concluído.

E pronto!

A partir do momento em que o deploy for finalizado, seu sistema estará 100% configurado para usar suas credenciais de produção.

Aviso Importante: Lembre-se que, a partir deste momento, qualquer pagamento gerado e pago através do sistema será uma transação real e movimentará dinheiro de verdade na sua conta do Mercado Pago.