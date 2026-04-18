<p align="center"><img src="src/assets/readme/readme.svg" width="400" alt="Sked API"></p>

# Requisitos e instalação

### Requisitos

<p align="center">
<a href="https://nodejs.org/pt">
<img src="https://img.shields.io/badge/Node-24.14.*-3C873A?logo=node.js&logoColor=FFF" alt="node 24.14.*"></a>
&nbsp
<a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">
<img src="https://img.shields.io/badge/NPM-11.9.*-CC3534?logo=npm&logoColor=FFF" alt="npm 11.9.*"></a>

### Instalação e teste

Para rodar este projeto é necessário ter uma _[aplicação backend própria](https://github.com/xJoaoPedro/node-sked-backend)_ instalada, configurada e hospedada.

#### Configuração do projeto

Após a instalação e configuração do backend, a clonagem do repositório e certificação de que todos os requisitos necessários estão atendidos, você deve clonar o arquivo `.env.example`, renomear para `.env` e preencher conforme suas variáveis locais, e rodar o seguinte comando no seu terminal:

<p style="color:yellow">
  ⚠️ Atenção: É expressamente necessário ter os endereços no .env preenchidos antes de rodar os comandos, caso contrário, terá que preencher e rodar os comandos novamente.
</p>

```
# instalar dependências do projeto
npm install
```

Agora com o projeto configurado, basta rodar `npm run dev` no terminal responsável por este projeto e no terminal onde está o backend.

E pronto! basta acessar seu `localhost:5173` nas rotas internas para testar o projeto!

<br />

### Tecnologias usadas

Além da _[API](https://github.com/xJoaoPedro/node-sked-backend)_ citada anteriormente, o sistema foi desenvolvido utilizando a biblioteca _[React](https://react.dev/)_, com auxílio do _[Vite](https://vite.dev/)_ como ferramenta de build e servidor de desenvolvimento, proporcionando inicialização rápida e uma experiência mais eficiente durante o desenvolvimento.

Para a estilização da interface, foi utilizado o framework _[Tailwind CSS](https://tailwindcss.com/)_, que permite a construção de layouts responsivos e consistentes por meio de classes utilitárias, reduzindo a necessidade de escrita de CSS customizado.

A aplicação foi construída seguindo o modelo de Single Page Application (SPA), onde toda a renderização ocorre no lado do cliente, sem recarregamento completo das páginas. Nesse contexto, o front-end não realiza processamento de regras de negócio ou manipulação direta de dados persistentes, sendo responsável exclusivamente pela camada de apresentação e interação com o usuário.

Toda a lógica de negócio e manipulação de dados é centralizada na API, com a qual o front-end se comunica por meio de requisições HTTP, garantindo uma separação clara entre as responsabilidades de interface e processamento.

<div align="center">

![Logo Sked API](https://img.shields.io/badge/Sked_API-00A676?logoColor=FFF)
![Logo React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=FFF)
![Logo Vite](https://img.shields.io/badge/Vite-9135FF?logo=vite&logoColor=FFF)
![Logo Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=FFF)
</div>

<br />

# Rotas internas do SPA

Embora todo o processamento de dados seja feito pela API, o sistema é desenvolvido como SPA e possui rotas internas para acesso nas tela, e esse roteamento se dá na seguinte forma:

| Rota | Página |
| ---- | ------ |
| `/login` | Página de login |

<p style="color:yellow">
  ⚠️ Atenção: As demais páginas dependem da autenticação da API e presença do Token JWT (recebido após login).
</p>

| Rota | Página |
| ---- | ------ |
| `/` | Elemento de Layout (responsável pelo SPA nas rotas) |
| `/dashboard` | Página de dashboard (principal) |
| `/daily-schedule` | Página de agendamentos do dia |
| `/appointments` | Página de agendamentos gerais |
| `/cancellations` | Página de cancelamentos |
| `/commissions` | Página de comissões |
| `/revenue` | Página de receita |
| `/reports` | Página de relatórios |
| `/inventory` | Página de estoque |
| `/services` | Página de serviços |
| `/professionals` | Página de profissionais |
| `/customers` | Página de clientes |
| `/settings` | Página de configurações |
