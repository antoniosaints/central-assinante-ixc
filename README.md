# Central do Assinante

Mini gerenciador de clientes para provedor de internet, com aparência e
experiência de aplicativo mobile moderno (estilo bancos digitais brasileiros).

> Apenas frontend + backend intermediário (proxy). **Sem banco de dados.**
> Enquanto a API real do provedor não existe, tudo funciona com **dados mockados**.

## Estrutura

```
CentralAssinante/
├── backend/     # Express + Axios — proxy para a API do provedor
└── frontend/    # Vue 3 + Vite + TailwindCSS + Pinia
```

## Stack

- **Backend:** Node.js, Express, Axios
- **Frontend:** Vue 3 (Composition API), Vue Router, Pinia, TailwindCSS, Axios, VueUse, Lucide

## Como rodar

Pré-requisito: Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # (Windows: copy .env.example .env)
npm run dev               # http://localhost:3333
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

O Vite já faz proxy de `/api` para o backend (`localhost:3333`).

### Acesso (demonstração)

A tela de login usa autenticação mockada. Credenciais de demo:

- **E-mail:** `joao.almeida@email.com`
- **Senha:** `123456`

O token é guardado em `localStorage`; as rotas ficam protegidas por um guard
do Vue Router e o botão **Sair** encerra a sessão.

## Integração com a API real (futuro)

Nada da interface precisa mudar. Basta:

1. No **backend**, preencher em `.env`:
   - `PROVIDER_API_BASE_URL` (URL da API do provedor)
   - `PROVIDER_API_TOKEN`
2. Os serviços em `backend/src/services/*.service.js` passam automaticamente a
   consumir a API real (ver `resolveData` em `_helpers.js`) em vez dos mocks.

O frontend só conversa com o backend — **nunca** com a API externa diretamente.

## Padrões

- Datas sempre em **dd/MM/yyyy** (sem horário) — `utils/format.js`.
- Valores sempre em **R$ 0,00** (moeda brasileira) — `utils/format.js`.
- Mobile-first; no desktop o conteúdo é centralizado numa moldura de app.
