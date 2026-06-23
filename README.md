<p align="center"><img src="src/assets/readme/readme.svg" width="400" alt="Sked Frontend"></p>

# Requisitos e instalação

### Requisitos

<p align="center">
<a href="https://nodejs.org/pt">
<img src="https://img.shields.io/badge/Node-24.14.*-3C873A?logo=node.js&logoColor=FFF" alt="node 24.14.*"></a>
&nbsp
<a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">
<img src="https://img.shields.io/badge/NPM-11.9.*-CC3534?logo=npm&logoColor=FFF" alt="npm 11.9.*"></a>

### Instalação e teste

Para rodar este projeto, é necessário ter uma _[aplicação backend própria](https://github.com/xJoaoPedro/node-sked-backend)_ instalada, configurada e disponível, já que este frontend consome a API HTTP e também depende da conexão Socket.IO do backend.

#### Configuração do projeto

Após configurar o backend e clonar este repositório, copie o arquivo `.env.example` para `.env` e preencha a variável abaixo com a URL base do backend:

```env
VITE_BASE_URL=
```

<p style="color:yellow">
  ⚠️ Atenção: o projeto depende de `VITE_BASE_URL` preenchida corretamente antes de iniciar o ambiente. Se a variável estiver vazia ou incorreta, será necessário ajustar e subir o frontend novamente.
</p>

```bash
# instalar dependências do projeto
npm install
```

Com o ambiente configurado, utilize:

```bash
npm run dev
```

Depois disso, acesse `http://localhost:5173`.

Também estão disponíveis os scripts:

```bash
npm run build
npm run lint
npm run preview
```

<br />

### Tecnologias usadas

Além da _[API](https://github.com/xJoaoPedro/node-sked-backend)_ citada anteriormente, o sistema foi desenvolvido com _[React](https://react.dev/)_, _[TypeScript](https://www.typescriptlang.org/)_ e _[Vite](https://vite.dev/)_.

Para a interface, o projeto utiliza _[Tailwind CSS](https://tailwindcss.com/)_ como base de estilização, componentes utilitários inspirados em _[shadcn/ui](https://ui.shadcn.com/)_ e bibliotecas complementares para formulários, gráficos e interação, como _React Hook Form_, _Recharts_, _Sonner_ e _Lucide React_.

A aplicação continua seguindo o modelo de Single Page Application (SPA), com renderização no cliente e integração direta com a API para autenticação, leitura e atualização de dados.

Atualmente, o frontend contempla:

- landing page pública do produto;
- autenticação de empresas e colaboradores;
- fluxo de cadastro de empresa com aprovação pendente;
- proteção de rotas por sessão e por perfil;
- dashboard com indicadores, gráfico de receita e agenda semanal;
- módulos de agenda, agendamentos, cancelamentos, receita, estoque, serviços, profissionais, clientes e configurações;
- integração com Socket.IO e automações relacionadas ao WhatsApp nas configurações.

O controle de sessão é baseado em token JWT armazenado localmente, usado tanto para proteger as rotas internas quanto para autenticar as requisições à API.

<div align="center">

![Logo Sked API](https://img.shields.io/badge/Sked_API-00A676?logoColor=FFF)
![Logo React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=FFF)
![Logo TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=FFF)
![Logo Vite](https://img.shields.io/badge/Vite-9135FF?logo=vite&logoColor=FFF)
![Logo Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=FFF)
</div>

<br />

# Rotas internas do SPA

Embora o processamento principal de dados seja feito pela API, o sistema possui rotas públicas e rotas protegidas no frontend.

### Rotas públicas

| Rota | Página |
| ---- | ------ |
| `/` | Landing page institucional |
| `/auth` | Página de login e cadastro |
| `/pending-approval` | Página de empresa aguardando aprovação |
| `/admin/companies` | Painel administrativo de aprovação de empresas |
| `*` | Página 404 |

<p style="color:yellow">
  ⚠️ Atenção: as rotas internas da aplicação dependem de autenticação válida via JWT. Sessões pendentes são redirecionadas para `/pending-approval`, e algumas páginas possuem restrição adicional por perfil de acesso.
</p>

### Rotas protegidas

| Rota | Página |
| ---- | ------ |
| `/dashboard` | Página de dashboard (principal) |
| `/daily-schedule` | Página de agenda do dia |
| `/appointments` | Página de agendamentos gerais |
| `/cancellations` | Página de cancelamentos |
| `/revenue` | Página de receita |
| `/inventory` | Página de estoque |
| `/services` | Página de serviços |
| `/professionals` | Página de profissionais |
| `/customers` | Página de clientes |
| `/settings` | Página de configurações |

As rotas de `/revenue` e `/professionals` possuem proteção adicional para impedir acesso de perfis de colaborador sem privilégio gerencial.
