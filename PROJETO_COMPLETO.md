# Escanix - Guia Completo para Recriação do Projeto

## Estrutura do Projeto

```
escanix/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── drizzle.config.ts
├── replit.md
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── vite.ts
│   └── replitAuth.ts
├── shared/
│   └── schema.ts
└── uploads/

```

## Comandos para Recriar o Projeto

### 1. Inicialização
```bash
npm init -y
```

### 2. Dependências Principais
```bash
npm install express @types/express
npm install react react-dom @types/react @types/react-dom
npm install typescript tsx
npm install vite @vitejs/plugin-react
npm install tailwindcss @tailwindcss/typography autoprefixer postcss
npm install drizzle-orm drizzle-kit drizzle-zod
npm install @neondatabase/serverless
npm install @tanstack/react-query
npm install wouter
npm install zod zod-validation-error
npm install express-session @types/express-session
npm install connect-pg-simple @types/connect-pg-simple
npm install multer @types/multer
npm install qrcode @types/qrcode
npm install passport passport-local @types/passport @types/passport-local
npm install openid-client
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-card
npm install @radix-ui/react-button @radix-ui/react-input @radix-ui/react-label
npm install @radix-ui/react-textarea @radix-ui/react-separator
npm install @radix-ui/react-tabs @radix-ui/react-badge @radix-ui/react-progress
npm install react-hook-form @hookform/resolvers
npm install framer-motion
npm install date-fns
npm install cmdk
npm install vaul
npm install input-otp
npm install next-themes
npm install react-day-picker
npm install recharts
npm install embla-carousel-react
npm install react-resizable-panels
```

### 3. Dependências de Desenvolvimento
```bash
npm install -D esbuild
```

## Arquivos de Configuração

### package.json
```json
{
  "name": "escanix",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "node build-deploy.js",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "server", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` com:
```
DATABASE_URL=sua_url_do_postgresql
NODE_ENV=development
SESSION_SECRET=uma_chave_secreta_aleatoria
REPLIT_AUTH_CLIENT_ID=seu_client_id_replit
REPLIT_AUTH_CLIENT_SECRET=seu_client_secret_replit
```

## Base de Dados

O projeto usa PostgreSQL com Drizzle ORM. Execute:
```bash
npm run db:push
```

## Para Executar

### Desenvolvimento:
```bash
npm run dev
```

### Produção:
```bash
npm run build
npm start
```

## Funcionalidades Implementadas

1. ✅ Sistema de autenticação com Replit Auth
2. ✅ Dashboard de vendedor com configurações
3. ✅ Upload de logo e menu (5MB limite)
4. ✅ Páginas públicas de cliente com QR codes
5. ✅ Sistema de avaliações com estrelas
6. ✅ Links para redes sociais
7. ✅ Sistema de cupons de desconto
8. ✅ Navegação mobile otimizada
9. ✅ Design responsivo estilo Orkut
10. ✅ Analytics básicas (visualizações, cliques)

## Observações Importantes

- Todos os textos estão em português brasileiro
- O projeto está configurado para deploy no Replit
- As páginas de cliente são públicas (sem login necessário)
- Upload de arquivos funciona apenas para imagens e PDFs
- Sistema de rating: 1 avaliação por cliente por dia
- URLs de cliente seguem padrão: `/client/{vendorId}`

## Última Atualização
Janeiro 2025 - Todas as funcionalidades testadas e funcionais.