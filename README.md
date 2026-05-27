# 🔑 auth-context-v2

Versão aprimorada do [auth-context](https://github.com/gabrielkras1/auth-context), com implementação completa de **Access Token + Refresh Token**, cookies **httpOnly/Secure** e endpoints dedicados de renovação e logout. Projeto fullstack com **React + TypeScript** no front-end e **Node.js** no back-end.

## 🚀 Tecnologias

### Front-end
| Tecnologia | Descrição |
|---|---|
| React | Biblioteca de interface |
| TypeScript | Tipagem estática |
| Context API | Gerenciamento global de autenticação |
| CSS | Estilização |

### Back-end
| Tecnologia | Descrição |
|---|---|
| Node.js | Ambiente de execução |
| JavaScript | Linguagem do servidor |
| JWT | Access Token e Refresh Token |
| Express | Servidor HTTP |
| Cookie-Parser | Manipulação de cookies |

## 📁 Estrutura do Projeto

```
auth-context-v2/
├── backend/          # API Node.js
│   ├── server.js     # Endpoints: /login, /refresh, /logout
│   └── package.json
├── frontend/         # Aplicação React
│   ├── src/
│   │   ├── contexts/ # AuthContext com renovação automática
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── package.json
└── README.md
```

## ⚙️ Como Executar

### Pré-requisitos
- Node.js instalado

### Back-end

```bash
cd backend
npm install
node server.js
```

### Front-end

```bash
cd frontend
npm install
npm start
```

## 🔐 Melhorias em Relação à v1

| Recurso | Descrição |
|---|---|
| **Access Token** | Expiração curta de **30 segundos** para demonstrar renovação automática |
| **Refresh Token** | Armazenado em cookie **httpOnly** + **Secure**, inacessível via JavaScript (proteção XSS) |
| **Endpoint `/refresh`** | Valida o cookie de renovação e emite novo Access Token automaticamente |
| **Endpoint `/logout`** | Remove o cookie de Refresh Token, encerrando a sessão completamente |
| **CORS** | Configurado com `credentials: true` para permitir tráfego de cookies entre domínios |

## 🔄 Fluxo de Autenticação

```
Usuário faz Login
      |
      v
Servidor retorna:
  - Access Token (30s)  →  armazenado em memória/Context
  - Refresh Token       →  armazenado em cookie httpOnly

      |
      v
Access Token expira?
      |
   Sim → Frontend chama automaticamente POST /refresh
              |
              v
        Cookie enviado automaticamente (httpOnly)
              |
              v
        Novo Access Token retornado → sessão renovada

      |
   Não → Requisição continua normalmente

Logout → POST /logout → cookie removido → sessão encerrada
```

## 🛡️ Segurança Implementada

- Cookie **httpOnly**: token de refresh inacessível via `document.cookie`
- Cookie **Secure**: trafega apenas via HTTPS em produção
- **CORS** com `credentials: true`
- Renovação automática transparente ao usuário

## 👤 Autor

**Gabriel Kras** — [@gabrielkras1](https://github.com/gabrielkras1)
