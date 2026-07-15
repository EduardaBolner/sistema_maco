# Sistema de Cadastros — Grande Loja Regular do Rio Grande do Sul

Aplicação web para centralizar o cadastro de Maçons e das entidades administrativas
relacionadas: Loja, Rito, Grau, Potência, Oriente, Estado e País.

## Stack

- **Frontend**: HTML5 + CSS3 + JavaScript puro (sem framework), consumindo a API via `fetch()`.
- **Backend**: Node.js + Express 4 — API REST.
- **Banco de dados**: PostgreSQL, acessado via `pg`.
- **Identidade visual**: preto e dourado, fontes Cinzel + Cormorant Garamond, selo oficial embutido em base64.

## Estrutura

```
sistema_maco/
  backend/
    src/
      server.js        # servidor Express
      db.js             # pool de conexão com o PostgreSQL
      routes/            # um arquivo por entidade
    sql/
      schema.sql         # schema relacional (DDL)
      migrations/         # alterações incrementais aplicadas sobre um banco já existente
    .env.example
  frontend/
    index.html           # login
    menu.html             # início (selo centralizado)
    macons-cadastro.html
    macons-listagem.html
    quadro-membros.html
    lojas.html
    ritos.html
    graus.html
    potencias.html
    orientes-paises.html
    css/style.css
    js/
```

## Modelo de dados

Baseado no ER fornecido pelo cliente, com a entidade Estado adicionada entre País e Oriente:

- **Pais** (`id_pais`, `ds_pais`)
- **Estado** (`id_estado`, `ds_estado`, `id_pais` → FK Pais)
- **Oriente** (`id_oriente`, `ds_oriente`, `id_estado` → FK Estado)
- **Potencia** (`id_potencia`, `nome`, `dt_criacao`)
- **Ritus** (`id_ritu`, `ds_ritu`, `dt_criacao`)
- **Grau** (`id_grau`, `ds_grau`, `id_ritu` → FK Ritus)
- **Lojas** (`id_loja`, `id_potencia`, `id_oriente`, `id_ritu`, `ds_loja`, `ds_endereco`, `nm_veneravel`, `dt_criacao`)
- **Macons** (`id_macom`, `cim` **único**, `id_loja`, `id_grau`, `nm_macom`, `dt_nascimento`, `dt_iniciacao`, `dt_elevacao`, `dt_exaltacao`, `nr_ddd`, `nr_celular`, `ds_endereco`)

## Como rodar

### 1. Banco de dados

Para uma instalação nova, crie o banco e aplique o schema completo:

```bash
createdb -U postgres sistema_maco
psql -U postgres -d sistema_maco -f backend/sql/schema.sql
```

Para um banco já existente em versão anterior, aplique as migrações na ordem:

```bash
psql -U postgres -d sistema_maco -f backend/sql/migrations/002_add_estado.sql
psql -U postgres -d sistema_maco -f backend/sql/migrations/003_add_usuario.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha PGPASSWORD com a senha do seu Postgres e gere um JWT_SECRET
npm start               # ou: npm run dev (recarrega automaticamente)
```

A API sobe em `http://localhost:3000`.

Crie o primeiro usuário do sistema (a senha é hasheada com bcrypt antes de ir para o banco):

```bash
node scripts/criar-usuario.js "Nome Completo" login senha
```

### 3. Frontend

O frontend é estático — sirva a pasta `frontend/` com qualquer servidor HTTP, por exemplo:

```bash
cd frontend
npx http-server -p 8080
```

Acesse `http://localhost:8080/index.html`.

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação — recebe `{ login, senha }`, retorna `{ token, nome }`. Credenciais inválidas retornam `401`. |
| GET/POST | `/paises` | Países |
| GET/POST | `/estados` | Estados (filtráveis por `?id_pais=`) |
| GET/POST | `/orientes` | Orientes (filtráveis por `?id_estado=`) |
| GET/POST | `/potencias` | Potências |
| GET/POST | `/ritos` | Ritos |
| GET/POST | `/graus` | Graus (filtráveis por `?id_ritu=`) |
| GET/POST | `/lojas` | Lojas (filtráveis por `?nome=`) |
| GET/POST | `/macons` | Maçons (filtráveis por `?nome=`, `?loja=`, `?cim=`) — CIM duplicado retorna `409`. Cada registro já vem com o nome da Loja, Rito, Grau, Potência, Oriente, Estado e País. |

Todas as rotas acima, exceto `/auth/login` e `/health`, exigem o cabeçalho `Authorization: Bearer <token>`. Sem token válido, a API responde `401`.

## Funcionalidades

- 10 telas: login (autenticação real), início (selo centralizado), cadastro e listagem de Maçons, Quadro de Membros, cadastro de Loja, Rito, Grau, Potência e Oriente/Estado/País (unificada).
- Autenticação real: senha hasheada com bcrypt, login gera um token JWT (validade de 12h) que protege toda a API.
- Filtragem dependente: ao escolher a Loja no cadastro de Maçom, o campo Grau libera apenas os graus do Rito daquela loja.
- Criação inline encadeada: no cadastro de Maçom, ao criar uma Loja nova é possível também buscar ou cadastrar na hora sua Potência, Rito e Oriente — e ao criar um Oriente novo, buscar ou cadastrar seu Estado, e ao criar um Estado novo, buscar ou cadastrar seu País. Tudo sem sair do formulário.
- Quadro de Membros: relatório com todos os Maçons cadastrados e seus vínculos completos (Loja, Rito, Grau, Potência, Oriente, Estado, País).
- Validação client-side e server-side, com tratamento de erro específico por campo (ex.: CIM duplicado).

## Pendências para produção

- Hospedagem da API e do banco em ambiente gerenciado, com backups.
- HTTPS e segredos de produção isolados.
- Listagem/busca nas demais entidades (hoje só Maçons e Lojas têm busca).
- Perfis de acesso (admin vs. secretaria).
